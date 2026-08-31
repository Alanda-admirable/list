// OpenNext configuration for Cloudflare
export default {
  default: {
    override: {
      wrapper: 'cloudflare-node',
      converter: 'edge',
      incrementalCache: 'dummy',
      tagCache: 'dummy',
      queue: 'dummy',
    },
  },
  dangerouslyUseUnsupportedNextVersion: true,
};
