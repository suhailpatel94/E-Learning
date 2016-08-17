from pymongo import MongoClient
import os
import json
client = MongoClient()
db = client.primer
coll = db.dataset
a=[]
b=[]
cur_path=os.getcwd().split('\\')[-1]
print(cur_path)
rootDir = "swift"
for dirName, subdirList, fileList in os.walk(rootDir):
    #print('Found directory: %s' %dirName)
    #print(__file__ + "\n")
 
  
    for fname in fileList:
        print('\t%s' % fname)
        filename, file_extension = os.path.splitext(fname)
        print(file_extension)
        
        wk=dirName.split('\\')[-2]
        if file_extension==".mp4":
          arr={}
          arr['week']=wk
          arr['name']=fname
          arr['url']="courses/"+dirName+"/"+fname
          arr['url']=arr['url'].replace('\\','/')
          a.append(arr)
              
        elif  file_extension==".pdf":
          arr={}
          #arr[wk]['week']=dirName.split('\\')[-2]
          arr['week']=wk
          arr['name']=fname
          arr['url']="courses/"+dirName+"/"+fname
          arr['url']=arr['url'].replace('\\','/')
          b.append(arr)
          
        
print("%r"%b)
  
db.courses.insert_one(
{
  "name":rootDir,
  "coverurl":"/courses/"+rootDir+"/cover/"+rootDir+".jpg",
  "material":{
    "vids":
      a
    ,
    "docs":
      b
    
  },
  "about": "This is swift course",

    "prerequisite": "Java,Basic Data Structures",
    "length": "5 weeks",
    "effort": "5 hours/week",
    "subject": "swift",
    "level": "Intermediate",
    "language": "English"
  
}
)
    