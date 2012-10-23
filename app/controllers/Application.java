package controllers;

import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import play.mvc.Controller;
import play.mvc.Result;
import views.html.index;
import views.search;

import java.io.FileInputStream;

public class Application extends Controller {

    public static Result index() {
        return ok(index.render("Your new application is ready."));
    }

    public static Result search() {
        return null;
    }

    public static void main(String[] args) {
//        resolve();
        System.out.println(search.render());
    }

    private static void resolve() {
        try {
            FileInputStream inputStream = new FileInputStream("/Users/twer/play/demo/conf/projects.xlsx");
            XSSFWorkbook workbook = new XSSFWorkbook(inputStream);
            XSSFSheet sheet = workbook.getSheet("Sheet1");
            XSSFRow row = sheet.getRow(0);

            String value = row.getCell(0).getStringCellValue();

            System.out.println(value);

        } catch (Exception e) {

            e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
        }
    }

}