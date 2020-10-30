
## 전 종목 코드를 가져온다 (금융 제외)
import request

issues = request.get_issue_list()

print('issue code : ', issues[0]['symbolCode'][1:])

# Create target Directory if don't exist
import os
dirName = '20190430'
if not os.path.exists(dirName):
    os.mkdir(dirName)
    print("Directory " , dirName ,  " Created ")
else:    
    print("Directory " , dirName ,  " already exists")

# # 재무정보을 파일로 저장
import request_fn

for issue in issues:
    sym = issue['symbolCode'][1:]
    request_fn.save_finance_html(sym, dirName)

import step2

step2.run(issues, dirName)

import step3
step3.run(issues)