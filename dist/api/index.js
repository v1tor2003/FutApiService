"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const conn_1 = __importDefault(require("../prisma/conn"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
// should configure cors to allow requests from the github pages app
const PORT = process.env.PORT || 3000;
/**
 * Checks if the provided team ID is valid.
 * @param id - The ID of the team to validate.
 * @returns A boolean indicating whether the team ID is valid.
 */
const isTeamIdValid = async (id) => !(isNaN(id) || id <= 0 || id > await conn_1.default.team.count());
/**
 * Retrieves a team by its ID.
 * @param req - The request object containing the team ID in the URL parameters.
 * @param res - The response object used to send the response back to the client.
 * @returns A JSON response with the team data if valid, or an error message if invalid or an exception occurs.
 */
app.get(`/api/v1/teams/:id`, async (req, res) => {
    try {
        const teamId = parseInt(req.params.id, 10);
        if (!(await isTeamIdValid(teamId)))
            return res.status(400).json({ error: 'Invalid team ID.' });
        res.status(200).json(await conn_1.default.team.findFirst({
            where: {
                id: teamId
            }
        }));
    }
    catch (error) {
        console.error('[LOG]: Error retrieving team data from database:', error);
        res.status(500).json({ error: 'Failed to retrive team.' });
    }
});
/**
 * Handles requests to unknown routes.
 * @param _ - The request object (not used).
 * @param res - The response object used to send a 404 status with an error message.
 * @returns A JSON response indicating that the resource was not found.
 */
app.use((_, res) => res.status(404).json({ error: 'Resource Not Found.' }));
/**
 * Starts the Express server.
 * @param PORT - The port on which the server will listen.
 * @returns None
 */
app.listen(PORT, async () => {
    console.log('[LOG]: Starting server...\n' +
        '[LOG]: Server up and running on port: ' + PORT);
});
exports.default = app;
