package controllers

import play.api.mvc.{Action, Controller}
import java.util.ArrayList
import play.api.libs.json.Json.toJson
import scala.collection.JavaConversions._
/**
 * Created with IntelliJ IDEA.
 * User: twer
 * Date: 10/26/12
 * Time: 4:47 PM
 * To change this template use File | Settings | File Templates.
 */

object JsonController extends Controller {

  def search = Action {

    val excelResolver = new ExcelResolver();
    val result = excelResolver.resolve("conf/projects.xlsx")

    val jsonResult = toJson(
      Map(
        "projects" ->
          (result.map(project =>
            toJson(
              Map(
                "name" -> toJson(project.getName()),
                "lat"  -> toJson(project.getLat()),
                "lng"  -> toJson(project.getLng()),
                "imageName"    -> toJson(project.getImageName()),
                "averagePrice" -> toJson(project.getAveragePrice()),
                "type"         -> toJson(project.getType()),
                "address"      -> toJson(project.getAddress()),
                "telephone"    -> toJson(project.getTelephone()),
                "developer"    -> toJson(project.getDeveloper()),
                "publishDate"  -> toJson(project.getPublishDate())
              )
            )
          )
        ).toSeq
      )
    )

    Ok(jsonResult);
  }

}