import { writeFile } from "fs";
import { Parser as json2csv } from "json2csv";

// export function exportPDF(data: any[], path: string) {
//     try {

//     } catch (error: any) {
//         throw error;
//     }
// }

// export function exportExcel(data: any[], path: string) {
//     try {

//     } catch (error: any) {
//         throw error;
//     }
// }

export function exportCSV(data: any[], path: string) {
  try {
    const json2csvParser = new json2csv();
    const csvData = json2csvParser.parse(data);
    writeFile(path, csvData, (err) => {
      if (err) throw err;
    });
  } catch (error: any) {
    throw error;
  }
}
