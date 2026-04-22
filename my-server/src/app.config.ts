import {
    defineServer,
    defineRoom,
    monitor,
    playground,
    createRouter,
    createEndpoint,
    matchMaker,
} from "colyseus";

/**
 * Import your Room files
 */
import { MyRoom } from "./rooms/MyRoom.js";
import { LobbyRoom } from "./rooms/LobbyRoom.js";
import prisma from "./db.js";

const server = defineServer({

    /**
     * Define your room handlers:
     */
    rooms: {
        my_room: defineRoom(MyRoom, { filterBy: ['isPrivate', 'gameMode'] }),
        lobby_room: defineRoom(LobbyRoom)
    },

    /**
     * Experimental: Define API routes. Built-in integration with the "playground" and SDK.
     * 
     * Usage from SDK: 
     *   client.http.get("/api/hello").then((response) => {})
     * 
     */
    routes: createRouter({
        api_hello: createEndpoint("/api/hello", { method: "GET", }, async (ctx) => {
            return { message: "Hello World" }
        })
    }),

    /**
     * Bind your custom express routes here:
     * Read more: https://expressjs.com/en/starter/basic-routing.html
     */
    express: (app) => {
        // Allow requests from any origin (Vercel, local dev, etc.)
        app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            if (req.method === 'OPTIONS') return res.sendStatus(200);
            next();
        });

        app.get("/hi", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });

        // Room listing for browse UI
        app.get("/api/rooms", async (_req, res) => {
            try {
                const rooms = await matchMaker.query({ name: "my_room" });
                res.json(rooms);
            } catch (err) {
                console.error("[api] /api/rooms error:", err);
                res.json([]);
            }
        });

        // Total online across lobby + game rooms
        app.get("/api/online", async (_req, res) => {
            try {
                const rooms = await matchMaker.query({});
                const total = rooms.reduce((sum: number, r: any) => sum + (r.clients || 0), 0);
                res.json({ total });
            } catch (err) {
                console.error("[api] /api/online error:", err);
                res.json({ total: 0 });
            }
        });

        // ── Player stats API ──────────────────────────────────────────────

        // Sync user record on login (creates or updates username)
        app.post("/api/users/sync", async (req, res) => {
            try {
                const { clerkId, username, email } = req.body ?? {};
                if (!clerkId) return res.status(400).json({ error: "clerkId required" });

                await prisma.user.upsert({
                    where: { clerkId },
                    create: { clerkId, username: username ?? "", email: email ?? "" },
                    update: { username: username ?? "", email: email ?? "" },
                });

                res.json({ ok: true });
            } catch (err) {
                console.error("[api] /api/users/sync error:", err);
                res.status(500).json({ error: "Internal server error" });
            }
        });

        // Fetch a player's cumulative stats
        app.get("/api/stats/:clerkId", async (req, res) => {
            try {
                const { clerkId } = req.params;
                const stats = await prisma.playerStats.findUnique({ where: { clerkId } });

                if (!stats) return res.json(null);

                res.json({
                    total_kills:  stats.totalKills,
                    total_deaths: stats.totalDeaths,
                    total_games:  stats.totalGames,
                    total_wins:   stats.totalWins,
                });
            } catch (err) {
                console.error("[api] /api/stats error:", err);
                res.status(500).json({ error: "Internal server error" });
            }
        });

        // Global leaderboard — returns per-mode + overall stats; client sorts each column
        app.get("/api/leaderboard", async (_req: any, res: any) => {
            try {
                const rows = await prisma.playerStats.findMany({
                    take: 50,
                    include: { user: { select: { username: true } } },
                });
                res.json(rows.map((r: any) => ({
                    username:     r.user.username,
                    total_kills:  r.totalKills,
                    total_deaths: r.totalDeaths,
                    total_wins:   r.totalWins,
                    total_games:  r.totalGames,
                    ffa_kills:    r.ffaKills,
                    ffa_deaths:   r.ffaDeaths,
                    ffa_wins:     r.ffaWins,
                    ffa_games:    r.ffaGames,
                    kc_confirms:  r.kcConfirms,
                    kc_kills:     r.kcKills,
                    kc_deaths:    r.kcDeaths,
                    kc_wins:      r.kcWins,
                    kc_games:     r.kcGames,
                })));
            } catch (err) {
                console.error("[api] /api/leaderboard error:", err);
                res.status(500).json({ error: "Internal server error" });
            }
        });

        /**
         * Use @colyseus/monitor
         * It is recommended to protect this route with a password
         * Read more: https://docs.colyseus.io/tools/monitoring/#restrict-access-to-the-panel-using-a-password
         */
        app.use("/monitor", monitor());

        /**
         * Use @colyseus/playground
         * (It is not recommended to expose this route in a production environment)
         */
        if (process.env.NODE_ENV !== "production") {
            app.use("/", playground());
        }
    }

});

export default server;