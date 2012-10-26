package views

import controllers.Project
import play.api.libs.json.Json._
import java.util.Collection

object search {

  def render(projects: Collection[Project]) = {
    toJson(
      Map(
        "id" -> "1",
        "name" -> "a"
      )
    ).toString;
  }
}
