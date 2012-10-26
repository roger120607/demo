package controllers;

import com.google.common.collect.Lists;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.FileInputStream;
import java.util.ArrayList;

/**
 * Created with IntelliJ IDEA.
 * User: twer
 * Date: 10/25/12
 * Time: 8:27 PM
 * To change this template use File | Settings | File Templates.
 */
public class ExcelResolver {

    private static final String SHEET_NAME = "Sheet1";

    public ArrayList<Project> resolve(String excelFile) {

        ArrayList<Project> projects = Lists.newArrayList();

        try {
            FileInputStream inputStream = new FileInputStream(excelFile);
            XSSFWorkbook workbook = new XSSFWorkbook(inputStream);
            XSSFSheet sheet = workbook.getSheet(SHEET_NAME);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                XSSFRow row = sheet.getRow(i);
                Project project = new Project();
                project.setName(row.getCell(0).getStringCellValue());
                project.setLat(Double.valueOf(row.getCell(1).getNumericCellValue()));
                project.setLng(Double.valueOf(row.getCell(2).getNumericCellValue()));
                project.setImageName(row.getCell(3).getStringCellValue());
                project.setAveragePrice(row.getCell(4).getStringCellValue());
                project.setType(row.getCell(5).getStringCellValue());
                project.setAddress(row.getCell(6).getStringCellValue());
                project.setTelephone(row.getCell(7).getStringCellValue());
                project.setDeveloper(row.getCell(8).getStringCellValue());
                project.setPublishDate(row.getCell(9).getStringCellValue());
                projects.add(project);
            }
        } catch (Exception e) {
            e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
        }

        return projects;
    }

}
