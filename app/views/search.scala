package views

import play.api.libs.json.Json._

object search {

  def render() = {
    toJson(
      Map(
        "id" -> "1",
        "name" -> "a"
      )
    ).toString;
  }
}
