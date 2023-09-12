export function countdown(startTime: string, endTime: string) {
  const startTimestamp = new Date(startTime).getTime();
  const endTimestamp = new Date(endTime).getTime();
  const currentTimestamp = new Date().getTime();

  const totalDuration = endTimestamp - startTimestamp;
  const elapsedDuration = currentTimestamp - startTimestamp;

  const remainingDuration = Math.max(0, endTimestamp - currentTimestamp);

  const hours = Math.floor(remainingDuration / 3600000);
  const minutes = Math.floor((remainingDuration % 3600000) / 60000);
  const seconds = Math.floor((remainingDuration % 60000) / 1000);

  const timerDisplay = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  const percentage = (elapsedDuration / totalDuration) * 100;

  return {
    timerDisplay,
    percentage,
    remaining: {
      hours,
      minutes,
      seconds,
    },
  };
}

export function stopwatch(
  startTime: string,
  lastElapsedMinutes: number,
  onMinuteIncrement: (elapsedMinutes: number) => void,
) {
  const startTimestamp = new Date(startTime).getTime();
  const currentTimestamp = new Date().getTime();
  const elapsedDuration = currentTimestamp - startTimestamp;

  const elapsedMinutes = Math.floor(elapsedDuration / 60000);
  const elapsedSeconds = Math.floor((elapsedDuration % 60000) / 1000);

  const elapsedHoursForDisplay = Math.floor(elapsedDuration / 3600000); // 1 hour = 3600000 milliseconds
  const elapsedMinutesForDisplay = Math.floor(
    (elapsedDuration % 3600000) / 60000,
  );

  const formattedHours = elapsedHoursForDisplay.toString().padStart(2, "0");
  const formattedMinutes = elapsedMinutesForDisplay.toString().padStart(2, "0");
  const formattedSeconds = elapsedSeconds.toString().padStart(2, "0");

  const displayText = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;

  if (elapsedMinutes > lastElapsedMinutes) {
    onMinuteIncrement(elapsedMinutes);
  }

  return {
    displayText,
  };
}
