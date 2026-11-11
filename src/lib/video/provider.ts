/**
 * Video provider abstraction. Playback is not connected in this phase:
 * no implementation is registered, and the UI offers no play action until
 * one is. Mux or Cloudflare Stream adapters implement this interface later
 * without changes to the rest of the app.
 */
export interface PlaybackGrant {
  /** Short lived, signed HLS manifest URL. Never a permanent private URL. */
  manifestUrl: string;
  expiresAt: string;
  drm?: { widevineLicenseUrl?: string; fairplayLicenseUrl?: string; fairplayCertificateUrl?: string };
}

export interface VideoProvider {
  readonly name: "mux" | "cloudflare_stream" | "aws";
  createUpload(input: { title: string; drm: boolean }): Promise<{ uploadUrl: string; providerAssetId: string }>;
  getAssetStatus(providerAssetId: string): Promise<"pending" | "processing" | "ready" | "errored">;
  createPlaybackGrant(input: { playbackId: string; viewerId: string; ttlSeconds: number; drm: boolean }): Promise<PlaybackGrant>;
  deleteAsset(providerAssetId: string): Promise<void>;
}

export const videoProvider: VideoProvider | null = null;
