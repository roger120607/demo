package controllers;

import junit.framework.TestCase;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: twer
 * Date: 10/25/12
 * Time: 10:17 PM
 * To change this template use File | Settings | File Templates.
 */
public class ExcelResolverTest extends TestCase {

    public void testResolve() throws Exception {

        ExcelResolver excelResolver = new ExcelResolver();
        List<Project> projects = excelResolver.resolve("/Users/twer/00_git/demo/conf/projects.xlsx");
        for (Project project : projects) {
            System.out.println(project.getName());
            System.out.println(project.getPublishDate());
        }
    }
}
