/** Optional Playgrounds stub. */
export default {
  async fetch(request) {
    return Response.json({ ok: true, name: "pg-fruitmerge", path: new URL(request.url).pathname });
  },
};
