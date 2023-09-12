function generateTahunUntukDipilih() {
  const years = [];
  for (let year = 1999; year <= 2099; year++) {
    years.push(year.toString());
  }
  return years;
}

function generateTanggal() {
  const dates = [];
  for (let date = 1; date <= 31; date++) {
    dates.push(date.toString().padStart(2, "0"));
  }
  return dates;
}

function generateWaktu() {
  const times = [];
  for (let time = 0; time <= 59; time++) {
    times.push(time.toString().padStart(2, "0"));
  }
  return times;
}

const generator = {
  generateTahunUntukDipilih,
  generateTanggal,
  generateWaktu,
};

export default generator;
