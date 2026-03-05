import { Router } from 'express';
import {
  getPlaylists,
  getPlaylistById,
  getPlaylistVideos,
} from '../controllers/playlistController.js';
import { requireGoogleToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/playlists', requireGoogleToken, getPlaylists);
router.get('/playlist/:id', requireGoogleToken, getPlaylistById);
router.get('/playlist/:id/videos', requireGoogleToken, getPlaylistVideos);

export default router;
