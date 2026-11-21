-- =========================================================================
-- CLONEWHATSAPP: BASE DE DATOS, STORAGE Y SEGURIDAD RLS (FASES 2, 8, 11, 12)
-- =========================================================================

-- 1. TABLA PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    avatar_url TEXT DEFAULT '',
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_typing BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABLA DEVICES (Tokens FCM para Fase 9 y Fase 10)
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    fcm_token TEXT NOT NULL,
    device_type TEXT DEFAULT 'android',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, fcm_token)
);

-- 3. TABLA CONVERSACIONES (Individuales y Grupales - Fase 5 y Fase 11)
CREATE TABLE IF NOT EXISTS public.conversaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_group BOOLEAN DEFAULT false,
    name TEXT DEFAULT '',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLA CONVERSACIONES_MEMBERS
CREATE TABLE IF NOT EXISTS public.conversaciones_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversacion_id UUID NOT NULL REFERENCES public.conversaciones(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(conversacion_id, user_id)
);

-- 5. TABLA MESSAGES (Texto, Imágenes y Estados - Fases 6, 8 y 11)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversacion_id UUID NOT NULL REFERENCES public.conversaciones(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_name TEXT DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    message_type TEXT NOT NULL DEFAULT 'text', -- 'text' o 'image'
    image_url TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'sent', -- 'sent', 'received', 'read'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indices para optimizar consultas y búsqueda de mensajes (Fase 11)
CREATE INDEX IF NOT EXISTS idx_messages_conversacion ON public.messages(conversacion_id, created_at);
CREATE INDEX IF NOT EXISTS idx_members_user ON public.conversaciones_members(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_user ON public.devices(user_id);

-- =========================================================================
-- TRIGGER AUTOMÁTICO AL REGISTRAR USUARIO EN SUPABASE AUTH
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        ''
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- FUNCIÓN SEGURA PARA OBTENER O CREAR CONVERSACIÓN 1 A 1 (FASE 5 Y FASE 12)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.get_or_create_direct_conversation(other_user_id UUID)
RETURNS UUID AS $$
DECLARE
    v_conv_id UUID;
    v_current_user UUID := auth.uid();
BEGIN
    IF v_current_user IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado';
    END IF;

    -- Buscar si ya existe conversación directa entre ambos usuarios
    SELECT cm1.conversacion_id INTO v_conv_id
    FROM public.conversaciones_members cm1
    JOIN public.conversaciones_members cm2 ON cm1.conversacion_id = cm2.conversacion_id
    JOIN public.conversaciones c ON c.id = cm1.conversacion_id
    WHERE c.is_group = false
      AND cm1.user_id = v_current_user
      AND cm2.user_id = other_user_id
    LIMIT 1;

    -- Si no existe, crearla y agregar ambos miembros
    IF v_conv_id IS NULL THEN
        INSERT INTO public.conversaciones (is_group, name, created_by)
        VALUES (false, '', v_current_user)
        RETURNING id INTO v_conv_id;

        INSERT INTO public.conversaciones_members (conversacion_id, user_id)
        VALUES (v_conv_id, v_current_user), (v_conv_id, other_user_id);
    END IF;

    RETURN v_conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- FASE 12: CONFIGURACIÓN DE ROW LEVEL SECURITY (RLS) Y PERMISOS
-- =========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversaciones_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Función auxiliar para validar pertenencia a una conversación sin recursión
CREATE OR REPLACE FUNCTION public.is_conversation_member(p_conv_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.conversaciones_members
        WHERE conversacion_id = p_conv_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para PROFILES
DROP POLICY IF EXISTS "Perfiles visibles para autenticados" ON public.profiles;
CREATE POLICY "Perfiles visibles para autenticados"
    ON public.profiles FOR SELECT
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Usuario inserta su propio perfil" ON public.profiles;
CREATE POLICY "Usuario inserta su propio perfil"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Usuario actualiza su propio perfil" ON public.profiles;
CREATE POLICY "Usuario actualiza su propio perfil"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Políticas para DEVICES (Protección de tokens FCM)
DROP POLICY IF EXISTS "Usuario gestiona sus propios tokens FCM" ON public.devices;
CREATE POLICY "Usuario gestiona sus propios tokens FCM"
    ON public.devices FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Políticas para CONVERSACIONES
DROP POLICY IF EXISTS "Miembros ven sus conversaciones" ON public.conversaciones;
CREATE POLICY "Miembros ven sus conversaciones"
    ON public.conversaciones FOR SELECT
    USING (public.is_conversation_member(id) OR created_by = auth.uid());

DROP POLICY IF EXISTS "Autenticados crean conversaciones" ON public.conversaciones;
CREATE POLICY "Autenticados crean conversaciones"
    ON public.conversaciones FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Políticas para CONVERSACIONES_MEMBERS
DROP POLICY IF EXISTS "Miembros ven participantes de su chat" ON public.conversaciones_members;
CREATE POLICY "Miembros ven participantes de su chat"
    ON public.conversaciones_members FOR SELECT
    USING (public.is_conversation_member(conversacion_id));

DROP POLICY IF EXISTS "Autenticados agregan miembros al crear chat" ON public.conversaciones_members;
CREATE POLICY "Autenticados agregan miembros al crear chat"
    ON public.conversaciones_members FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Políticas para MESSAGES (Validación estricta por conversación y autor)
DROP POLICY IF EXISTS "Solo miembros leen mensajes de su conversación" ON public.messages;
CREATE POLICY "Solo miembros leen mensajes de su conversación"
    ON public.messages FOR SELECT
    USING (public.is_conversation_member(conversacion_id));

DROP POLICY IF EXISTS "Solo miembros envían mensajes como sí mismos" ON public.messages;
CREATE POLICY "Solo miembros envían mensajes como sí mismos"
    ON public.messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id AND public.is_conversation_member(conversacion_id));

DROP POLICY IF EXISTS "Miembros actualizan estado de lectura" ON public.messages;
CREATE POLICY "Miembros actualizan estado de lectura"
    ON public.messages FOR UPDATE
    USING (public.is_conversation_member(conversacion_id));

DROP POLICY IF EXISTS "Solo el autor elimina sus propios mensajes" ON public.messages;
CREATE POLICY "Solo el autor elimina sus propios mensajes"
    ON public.messages FOR DELETE
    USING (auth.uid() = sender_id);

-- =========================================================================
-- FASE 11: BUCKETS DE SUPABASE STORAGE (AVATARES E IMÁGENES DE CHAT)
-- =========================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true), ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Lectura pública de imágenes" ON storage.objects;
CREATE POLICY "Lectura pública de imágenes"
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('avatars', 'chat-images'));

DROP POLICY IF EXISTS "Usuarios autenticados suben imágenes" ON storage.objects;
CREATE POLICY "Usuarios autenticados suben imágenes"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id IN ('avatars', 'chat-images') AND auth.role() = 'authenticated');
