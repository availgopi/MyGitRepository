import pandas as pd
import numpy as np
class Univariate:
    def Quanqual(dataset):
        quan=[]
        qual=[]
        for columnName in dataset.columns:
            if dataset[columnName].dtypes == 'O':
                qual.append(columnName)
            else:
                quan.append(columnName)
        return quan,qual
    
    def CheckLesserGreaterOutlier(describe, quan):
        lesser=[]
        greater=[]
        for column in quan:
            if describe[column]["Min"] < describe[column]["Lesser"]:
                lesser.append(column)
            if describe[column]["Max"] > describe[column]["Greater"]:
                greater.append(column)
        return lesser, greater
    
    def ReplaceLesserGreater(dataset,describe,quan):
        lesser,greater=Univariate.CheckLesserGreaterOutlier(describe,quan)
        for column in lesser:
            dataset[column][dataset[column] < describe[column]["Lesser"]] = describe[column]["Lesser"]
        for column in greater:
            dataset[column][dataset[column] > describe[column]["Greater"]] = describe[column]["Greater"]
        return describe
    
    def getFrequency(dataset,quan):
        freq_tables={}
        for column in quan:
           vc = dataset[column].value_counts()
           freqTable = pd.DataFrame({
               "Unique Values":vc.index, 
               "Frequency":vc.values,
               "Relative Frequency":vc.values / vc.values.sum(), 
               "Cummulative Frequency": vc.values.cumsum()       
           })
           freq_tables[column] = freqTable
        return freq_tables
    
    def CreateDataFrame(dataset, quan):

        describe = pd.DataFrame(index=("Mean", "Median", "Mode","Q1:25%","Q2:50%","Q3:75%","99%","Q4:100%", "IQR", "1.5Rule", "Lesser", "Greater", "Min","Max", "Kurtosis", "Skew", "var", "std"), columns=quan)
        for column in describe.columns:
            describe[column]["Mean"]=dataset[column].mean()
            describe[column]["Median"]=dataset[column].median()
            describe[column]["Mode"]=dataset[column].mode()[0]
            describe[column]["Q1:25%"]=dataset.describe()[column]["25%"]
            describe[column]["Q2:50%"]=dataset.describe()[column]["50%"]
            describe[column]["Q3:75%"]=dataset.describe()[column]["75%"]
            describe[column]["99%"]=np.percentile(dataset[column],99)
            describe[column]["Q4:100%"]=dataset.describe()[column]["max"]
            describe[column]["IQR"] = describe[column]["Q3:75%"] - describe[column]["Q1:25%"]
            describe[column]["1.5Rule"] = 1.5 * describe[column]["IQR"]
            describe[column]["Lesser"] = describe[column]["Q1:25%"] - describe[column]["1.5Rule"]
            describe[column]["Greater"] = describe[column]["Q3:75%"] + describe[column]["1.5Rule"]
            describe[column]["Min"]=dataset[column].min()
            describe[column]["Max"]=dataset[column].max()
            describe[column]["Kurtosis"]=dataset[column].kurtosis()
            describe[column]["Skew"]=dataset[column].skew()
            describe[column]["var"]=dataset[column].var()
            describe[column]["std"]=dataset[column].std()

        return describe