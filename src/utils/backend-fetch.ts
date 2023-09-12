export default async function backendFetch(
  channelName: string,
  ...args: unknown[]
) {
  const result = await window.api.call(channelName, ...args);
  return result;
}
