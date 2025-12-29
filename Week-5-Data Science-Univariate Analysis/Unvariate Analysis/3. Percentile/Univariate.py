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