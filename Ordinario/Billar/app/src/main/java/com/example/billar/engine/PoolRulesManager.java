package com.example.billar.engine;

import com.example.billar.model.Ball;
import java.util.ArrayList;
import java.util.List;

public class PoolRulesManager {
    public static final int MODE_CPU = 0;
    public static final int MODE_2P = 1;
    public static final int MODE_PRACTICE = 2;

    public static final int GROUP_NONE = 0;
    public static final int GROUP_SOLIDS = 1;
    public static final int GROUP_STRIPES = 2;

    private final int gameMode;
    private int currentPlayer = 1;
    private int p1Group = GROUP_NONE;
    private int p2Group = GROUP_NONE;
    private boolean breakShot = true;
    private boolean ballInHand = true;
    private boolean gameOver = false;
    private int winnerPlayer = 0;
    private String statusMessage = "Saque inicial — Jugador 1";

    private Ball firstTouchedBall = null;
    private final List<Ball> pocketedThisTurn = new ArrayList<>();

    public PoolRulesManager(int gameMode) {
        this.gameMode = gameMode;
        if (gameMode == MODE_PRACTICE) {
            statusMessage = "Práctica Libre — Tira cuando quieras";
        }
    }

    public void onShotStarted() {
        firstTouchedBall = null;
        pocketedThisTurn.clear();
        ballInHand = false;
    }

    public void recordFirstContact(Ball ball) {
        if (firstTouchedBall == null) {
            firstTouchedBall = ball;
        }
    }

    public void recordBallPocketed(Ball ball) {
        pocketedThisTurn.add(ball);
    }

    public void evaluateTurn(List<Ball> allBalls, String p1Name, String p2Name) {
        if (gameMode == MODE_PRACTICE) {
            for (Ball b : pocketedThisTurn) {
                if (b.number == 0) {
                    b.resetState();
                    ballInHand = true;
                }
            }
            statusMessage = "Práctica Libre";
            return;
        }

        boolean cuePocketed = false;
        boolean eightPocketed = false;
        int solidsPocketed = 0;
        int stripesPocketed = 0;

        for (Ball b : pocketedThisTurn) {
            if (b.number == 0) cuePocketed = true;
            else if (b.number == 8) eightPocketed = true;
            else if (b.type == Ball.TYPE_SOLID) solidsPocketed++;
            else if (b.type == Ball.TYPE_STRIPE) stripesPocketed++;
        }

        int myGroup = (currentPlayer == 1) ? p1Group : p2Group;
        boolean clearedMyGroup = hasClearedGroup(allBalls, myGroup);

        if (eightPocketed) {
            gameOver = true;
            if (breakShot || cuePocketed || !clearedMyGroup ||
                    (firstTouchedBall != null && firstTouchedBall.number != 8)) {
                winnerPlayer = (currentPlayer == 1) ? 2 : 1;
                String winName = (winnerPlayer == 1) ? p1Name : p2Name;
                statusMessage = "¡Falta con Bola 8! Gana " + winName;
            } else {
                winnerPlayer = currentPlayer;
                String winName = (winnerPlayer == 1) ? p1Name : p2Name;
                statusMessage = "¡VICTORIA DE " + winName.toUpperCase() + "!";
            }
            return;
        }

        boolean foul = false;
        String foulReason = "";

        if (cuePocketed) {
            foul = true;
            foulReason = "Blanca embocada";
        } else if (firstTouchedBall == null) {
            foul = true;
            foulReason = "Sin contacto con bolas";
        } else if (!breakShot && myGroup != GROUP_NONE) {
            if (clearedMyGroup) {
                if (firstTouchedBall.number != 8) {
                    foul = true;
                    foulReason = "Debías golpear la Bola 8";
                }
            } else {
                int touchedGroup = (firstTouchedBall.type == Ball.TYPE_SOLID) ? GROUP_SOLIDS :
                        (firstTouchedBall.type == Ball.TYPE_STRIPE) ? GROUP_STRIPES : GROUP_NONE;
                if (touchedGroup != myGroup) {
                    foul = true;
                    foulReason = "Golpeaste bola contraria";
                }
            }
        }

        boolean validGroupPocketed = false;
        if (!foul && !breakShot && p1Group == GROUP_NONE) {
            if (solidsPocketed > 0 && stripesPocketed == 0) {
                assignGroups(currentPlayer, GROUP_SOLIDS);
                validGroupPocketed = true;
            } else if (stripesPocketed > 0 && solidsPocketed == 0) {
                assignGroups(currentPlayer, GROUP_STRIPES);
                validGroupPocketed = true;
            } else if (solidsPocketed > 0 || stripesPocketed > 0) {
                validGroupPocketed = true;
            }
        } else if (!foul) {
            if (breakShot) {
                validGroupPocketed = (solidsPocketed + stripesPocketed) > 0;
            } else if (myGroup == GROUP_SOLIDS) {
                validGroupPocketed = solidsPocketed > 0;
            } else if (myGroup == GROUP_STRIPES) {
                validGroupPocketed = stripesPocketed > 0;
            }
        }

        breakShot = false;

        if (foul) {
            switchTurn();
            ballInHand = true;
            String nextName = (currentPlayer == 1) ? p1Name : p2Name;
            statusMessage = "Falta (" + foulReason + ") — Bola en mano: " + nextName;
        } else if (validGroupPocketed) {
            String curName = (currentPlayer == 1) ? p1Name : p2Name;
            statusMessage = "¡Buen tiro! Sigue " + curName;
        } else {
            switchTurn();
            String nextName = (currentPlayer == 1) ? p1Name : p2Name;
            statusMessage = "Turno de " + nextName;
        }
    }

    private void assignGroups(int player, int group) {
        if (player == 1) {
            p1Group = group;
            p2Group = (group == GROUP_SOLIDS) ? GROUP_STRIPES : GROUP_SOLIDS;
        } else {
            p2Group = group;
            p1Group = (group == GROUP_SOLIDS) ? GROUP_STRIPES : GROUP_SOLIDS;
        }
    }

    private void switchTurn() {
        currentPlayer = (currentPlayer == 1) ? 2 : 1;
    }

    public boolean hasClearedGroup(List<Ball> balls, int group) {
        if (group == GROUP_NONE) return false;
        int targetType = (group == GROUP_SOLIDS) ? Ball.TYPE_SOLID : Ball.TYPE_STRIPE;
        for (Ball b : balls) {
            if (!b.pocketed && b.type == targetType) return false;
        }
        return true;
    }

    public boolean isBallLegalTarget(Ball b, List<Ball> allBalls) {
        if (b.pocketed || b.number == 0) return false;
        if (gameMode == MODE_PRACTICE) return true;
        int myGroup = (currentPlayer == 1) ? p1Group : p2Group;
        if (myGroup == GROUP_NONE) return b.number != 8;
        if (hasClearedGroup(allBalls, myGroup)) return b.number == 8;
        int bGroup = (b.type == Ball.TYPE_SOLID) ? GROUP_SOLIDS :
                (b.type == Ball.TYPE_STRIPE) ? GROUP_STRIPES : GROUP_NONE;
        return bGroup == myGroup;
    }

    public int getGameMode() { return gameMode; }
    public int getCurrentPlayer() { return currentPlayer; }
    public int getP1Group() { return p1Group; }
    public int getP2Group() { return p2Group; }
    public boolean isBreakShot() { return breakShot; }
    public boolean isBallInHand() { return ballInHand; }
    public boolean isGameOver() { return gameOver; }
    public int getWinnerPlayer() { return winnerPlayer; }
    public String getStatusMessage() { return statusMessage; }
}
