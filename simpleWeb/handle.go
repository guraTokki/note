package main

import (
	//"os"
	//"bufio"
	"fmt"
	"io/ioutil"
	"strings"
	"net/http"
	"strconv"
	"math"
	"sort"

	"github.com/labstack/echo"
)

type FinanceInfo struct {
	Day string		`json:"day"`
	Eps_c string	`json:"eps_c"`
	Eps_i   string	`json:"eps_i"`
	Per     string	`json:"per"`
	Net_asset_per_share string	`json:"netAssetPerShare"`
	Pbr		string				`json:"pbr"`
	Dividend_per_share	string	`json:"dividendPerShare"`
	Dividend_rate	string		`json:"dividendRate"`
	Roe		string				`json:"roe"`
	Net_margin	string			`json:"netMargin"`
	Op_margin	string			`json:"opMargin"`
	Price		string			`json:"price"`
}

type IssueFinance struct {
	Code string			`json:"code"`
	CurPrice	string	`json:"curPrice"`
	Data [13]FinanceInfo	`json:"data"`
	AvgRoe float64			`json:"avgRoe"`
	Stddev float64			`json:"stdDev"`
	A		float64			`json:"A"`
	B		float64			`json:"B"`
	E		float64			`json:"E"`
	EnetAsset	float64		`json:"enetAsset"`
	Expect		float64		`json:"expect"`
}

type ByYieldDesc []*IssueFinance

func (a ByYieldDesc) Len() int {return len(a)}
func (a ByYieldDesc) Swap(i, j int)		{a[i], a[j] = a[j], a[i] }
func (a ByYieldDesc) Less(i, j int) bool { return a[i].Expect > a[j].Expect }

func readData(lines []string, sln, eln int) IssueFinance {
	//fmt.Println(sln, eln)
	//fmt.Printf("%s\n",lines[sln])
	//fmt.Printf("%s\n",lines[eln])

	var aaa IssueFinance

	for ii := sln; ii < eln; ii++ {
		line := lines[ii]
		words := strings.Split(line, "\t")
		
		if len(words) < 2 {
			continue
		}
		//fmt.Println(words[0])
		switch words[1] {
		case "투자지표":
			aaa.Code = words[0][1:]
			/*
			fmt.Printf("%s %s %s %s %s \n", words[0], words[1], words[2], words[3], words[13])
			fmt.Printf("%s %s %s %s %s\n", words[0], words[1], words[2], words[3], words[13])
			fmt.Printf("%s %s %s %s %s \n", words[0], words[1], words[2], words[3], words[13])
			*/
			for ij := 2; ij < len(words); ij++ {
				//fmt.Println(words[ij])
				//fmt.Printf("%s %s %d %d %s\n", words[0], words[1], ij, len(words), words[ij])
				aaa.Data[ij-2].Day = words[ij]
			}
		case "주당순이익(EPS,연결지배)":
			for ij := 2; ij < len(words); ij++ {
				aaa.Data[ij-2].Eps_c = words[ij]
			}
		case "주당순이익(EPS,개별)":
			for ij := 2; ij < len(words); ij++ {
				aaa.Data[ij-2].Eps_i = words[ij]
			}
		case "PER (배)":
			for ij := 2; ij < len(words); ij++ {
				aaa.Data[ij-2].Per = words[ij]
			}
		case "주당순자산(지분법)":
			for ij := 2; ij < len(words); ij++ {
				aaa.Data[ij-2].Net_asset_per_share = words[ij]
			}
		case "PBR (배)":
			for ij := 2; ij < len(words); ij++ {
				aaa.Data[ij-2].Pbr = words[ij]
			}
		case "주당 배당금":
			for ij := 2; ij < len(words); ij++ {
				aaa.Data[ij-2].Dividend_per_share = words[ij]
			}
		case "시가 배당률":
			for ij := 2; ij < len(words); ij++ {
				aaa.Data[ij-2].Dividend_rate = words[ij]
			}
		case "ROE (%)":
			for ij := 2; ij < len(words); ij++ {
				aaa.Data[ij-2].Roe = words[ij]
			}
		case "순이익률 (%)":
			for ij := 2; ij < len(words); ij++ {
				aaa.Data[ij-2].Net_margin = words[ij]
			}
		case "영업이익률 (%)":
			for ij := 2; ij < len(words); ij++ {
				aaa.Data[ij-2].Op_margin = words[ij]
			}
		case "주가":
			for ij := 2; ij < len(words); ij++ {
				aaa.Data[ij-2].Price = words[ij]
			}

		}
	}
	return aaa
}

func filter(recs []*IssueFinance) []*IssueFinance {
	var arr []*IssueFinance

	for _,item := range recs {
		if item.AvgRoe < 0.0 || item.AvgRoe < item.Stddev || item.A < -10	{
			
			continue
		}
		

		arr = append(arr, item)
	}
	return arr
}

func loadTenYears() []*IssueFinance {
	content,_ := ioutil.ReadFile("./data/tenYear.txt")

	lines := strings.Split(string(content), "\n")

	/*
	sln := 0;
	eln := 0;
	ln := 0
	*/
	var slnums []int
	//slnums := make([]int, 1024)
	for ii:=0; ii < len(lines); ii++ {
		words := strings.Split(strings.Trim(lines[ii],"\r"), "\t")
		//fmt.Println(words)
		if len(words) > 1 && words[1] == "투자지표" {
			slnums = append(slnums, ii)
		}
	}
	slnums = append(slnums, len(lines))

	//fmt.Println(slnums)

	var recs []*IssueFinance
	for ii := 0; ii < len(slnums)-1 ; ii++ {
		aaa := readData(lines, slnums[ii], slnums[ii+1]-1)
		recs = append(recs, &aaa)
	}
	fmt.Printf("%+v \n", recs[0])
	return recs
}

func handleTenYear(c echo.Context) error {

	allQuote := loadQuote()

	recs := loadTenYears()
	for _,item := range(recs) {
		fmt.Printf("code %s\n", item.Code)

		item.CurPrice,_ = allQuote[item.Code]

		avg_roe := 0.0

		var arr5 []string
		for _,data := range item.Data[1:6] {
			arr5 = append(arr5, data.Roe)
		}
		avg_roe = average(arr5)
		dev := stddev(arr5)
		//fmt.Printf("avg:%f dev : %f\n", avg_roe, dev)

		a,b,e := linearRegression(reverseData(arr5))
		item.AvgRoe = avg_roe
		item.Stddev = dev
		
		item.A = a
		item.B = b
		item.E = e

		r := avg_roe/100
		na := 0.0
		if item.Data[0].Net_asset_per_share != "N/A" {
			na,_ = strconv.ParseFloat(item.Data[0].Net_asset_per_share,64)
		} else {
			na,_ = strconv.ParseFloat(item.Data[1].Net_asset_per_share,64)
		}
		item.EnetAsset = na*math.Pow(1+r, 10)

		if curPrice,err := strconv.ParseFloat(item.CurPrice,64); err == nil {
			X := item.EnetAsset/curPrice

			r := math.Pow(10, math.Log10(X)/10)
			item.Expect = r

			fmt.Printf("code : %s X:%f(%f/%f,%s) r: %f\n", item.Code, X, item.EnetAsset,  curPrice, item.CurPrice, r)
		}
		//exp := 
		
	}
	fmt.Printf("avgRoe: %f\n", recs[0].AvgRoe)
	
	recs = filter(recs)
	sort.Sort(ByYieldDesc(recs))

	return c.JSON(http.StatusOK, recs[0:50])
	//fmt.Printf("%+v \n", recs[1])
}

func loadQuote() map[string]string {
	content,_ := ioutil.ReadFile("./data/allQuote.txt")

	lines := strings.Split(string(content), "\n")

	allQuote := make(map[string]string, 7000)
	for ii:=0; ii < len(lines); ii++ {
		words := strings.Split(strings.Trim(lines[ii],"\r"), "\t")
		if len(words) != 4 {
			continue
		}
		code := words[0][1:]
		//name := words[1]
		price := words[3]
		//fmt.Printf("code : %s price : %s\n", code, price)
		allQuote[code] = price
	}
	//fmt.Printf("%v\n", allQuote)
	//fmt.Printf("005930: %s\n", allQuote["005930"])
	//fmt.Printf("005930: %s\n", allQuote["000660"])
	return allQuote
}

/*
func main() {
	allQuote := loadQuote()

	recs := loadTenYears()
	for _,item := range(recs) {
		//fmt.Printf("code %s\n", item.Code)

		item.CurPrice,_ = allQuote[item.Code]

		avg_roe := 0.0

		var arr5 []string
		for _,data := range item.Data[1:6] {
			arr5 = append(arr5, data.Roe)
		}
		avg_roe = average(arr5)
		dev := stddev(arr5)
		//fmt.Printf("avg:%f dev : %f\n", avg_roe, dev)

		a,b,e := linearRegression(reverseData(arr5))
		item.AvgRoe = avg_roe
		item.Stddev = dev
		
		item.A = a
		item.B = b
		item.E = e

		r := avg_roe/100
		na := 0.0
		if item.Data[0].Net_asset_per_share != "N/A" {
			na,_ = strconv.ParseFloat(item.Data[0].Net_asset_per_share,64)
		} else {
			na,_ = strconv.ParseFloat(item.Data[1].Net_asset_per_share,64)
		}
		item.EnetAsset = na*math.Pow(1+r, 10)

		if curPrice,err := strconv.ParseFloat(item.CurPrice,64); err == nil {
			X := item.EnetAsset/curPrice
			r := math.Pow(10, math.Log10(X)/10)
			item.Expect = r
			//fmt.Printf("code : %s X:%f(%f/%f,%s) r: %f\n", item.Code, X, item.EnetAsset,  curPrice, item.CurPrice, r)
		} else {
			fmt.Printf("ERROR ParseFloat(%s) %s\n", item.CurPrice, err)
		}
		//exp := 
		
	}

	sort.Sort(ByYieldDesc(recs))
	fmt.Printf("Expect: %f\n", recs[0].Expect)
	fmt.Printf("Expect: %f\n", recs[50].Expect)
	fmt.Printf("Expect: %f\n", recs[100].Expect)
	fmt.Printf("Expect: %f\n", recs[500].Expect)
	fmt.Printf("Expect: %f\n", recs[1000].Expect)
	fmt.Printf("Expect: %f\n", recs[len(recs)-1].Expect)
}
*/

func reverseData(data []string) []string {
	last := len(data)

	var res []string
	for ii:=0; ii<last; ii++ {
		res = append(res, data[last-ii-1])
	}
	return res
}

func average(data []string) float64 {
	sum := 0.0
	count := 0
	avg := 0.0
	for _,item := range data {
		val, err := strconv.ParseFloat(item, 64)
		if err != nil {
			continue
		}
		sum += val
		count++
	}
	if count > 0 {
		avg = sum/float64(count)
	}
	return avg
}

func stddev(data []string) float64 {
	avg := average(data)

	sum := 0.0
	count := 0
	dev := 0.0

	for _, item := range data {
		val, err := strconv.ParseFloat(item, 64)
		if err != nil {
			continue
		}
		sum += math.Pow(val - avg, 2)
		count++
	}
	if count > 0 {
		dev = math.Sqrt(sum/float64(count))
	}
	return dev
}

func linearRegression(data []string) (a,b,e float64) {
	sum_x := 0.0
	count := 0
	sum_y := 0.0

	avg_x := 0.0
	avg_y := 0.0

	for ii, item := range data {
		val, err := strconv.ParseFloat(item, 64)
		if err != nil {
			continue
		}
		sum_y += val
		sum_x += float64(ii+1)
		count++
	}

	if count == 0 {
		return 0,0,0
	}

	if count > 0 {
		avg_x = sum_x/float64(count)
		avg_y = sum_y/float64(count)
	}

	a = 0.0
	sum_c := 0.0
	sum_m := 0.0
	for ii, item := range data {
		val, err := strconv.ParseFloat(item, 64)
		if err != nil {
			continue
		}
		x := float64(ii)+1
		//fmt.Printf("x : %f, y : %f\n", x, val)
		sum_c += (val - avg_y)*(x - avg_x)
		sum_m += math.Pow(x-avg_x,2)
	}
	a = sum_c/sum_m
	b = avg_y - a*avg_x

	sum_e := 0.0
	for ii, item := range data {
		val, err := strconv.ParseFloat(item, 64)
		if err != nil {
			continue
		}
		x := float64(ii+1)
		sum_e += math.Pow(val - (a*x + b), 2)
	}

	e = math.Sqrt(sum_e/float64(count))

	fmt.Printf("a : %f, b: %f e: %f\n", a, b, e)
	return a,b,e
}