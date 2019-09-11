package main

import (
	//"net/http"
	"github.com/labstack/echo"
	//"log"

)

func main() {
	e := echo.New()

	e.Static("/static", "static")

	e.GET("/api/tenYear", handleTenYear)

	e.Start(":9870")
}