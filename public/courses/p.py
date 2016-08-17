from pymongo import MongoClient
import os
import json
import demjson
client = MongoClient()
db = client.primer
coll = db.dataset


cur_path=os.getcwd().split('\\')[-1]
print(cur_path)
rootDir = "Android Development"


director=os.listdir(rootDir)
del(director[0])

asd=[]
c=""
for i in director:
  v=""
  d=""
  wkv={}
  wkd={}
  tmpa={}
  tmpb={}
  for dirName, subdirList, fileList in os.walk(rootDir+"/"+i):
  
    for fname in fileList:
      filename, file_extension = os.path.splitext(fname)
      if file_extension==".mp4":
        arr={}
        arr['name']=fname
        arr['url']="courses/"+dirName+"/"+fname
        arr['url']=arr['url'].replace('\\','/')
        v+=str(arr)
       
            
      elif  file_extension==".pdf":
        arr={}
        arr['name']=fname
        arr['url']="courses/"+dirName+"/"+fname
        arr['url']=arr['url'].replace('\\','/')
        d=d+str(arr)

  
  #z = v.copy()
  #z.update(d)
  tmpa['vids']=v
  wkv[i]=tmpa
  tmpb['docs']=d
  wkd[i]=tmpb
  
  jsona=str(wkv)+str(wkd)
  print(jsona)
  c+=jsona
c=demjson.encode(c)
  
  #print(asd)
#print(c)

