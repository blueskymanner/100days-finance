import sample from 'lodash/sample';
// Array of available nodes to connect to
export const nodes = ["https://api.avax.network/ext/bc/C/rpc"];

const getNodeUrl = () => {
  return sample(nodes);
};

export default getNodeUrl;
