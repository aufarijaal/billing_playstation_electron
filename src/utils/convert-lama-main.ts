export default function translateDurationToIndonesian(
  duration: string,
): string {
  const parts = duration.split(":").map(Number);

  const hours = parts[0];
  const minutes = parts[1];
  const seconds = parts[2];

  const translatedParts = [];

  if (hours > 0) {
    translatedParts.push(`${hours} Jam`);
  }

  if (minutes > 0) {
    translatedParts.push(`${minutes} Menit`);
  }

  if (seconds > 0) {
    translatedParts.push(`${seconds} Detik`);
  }

  return translatedParts.join(" ");
}
