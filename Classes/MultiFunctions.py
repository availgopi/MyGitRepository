class MultiFunctions:
    
        def OddEven():
            num = int(input("Enter a Number: "))
            if((num % 2) == 1):
                print(num, "is Odd Number")
            else:
                print(num, "is Even Number")

        def Eligible():
            gender=input("Enter the gender: ")
            age=int(input("Enter the age" ))
            if(gender == "male" and age < 21) or (gender == "female" and age < 18):
                print("NOT ELIGIBLE")
            else:
                print("ELIGIBLE")

        def Percentage():
            subject1 = int(input("Subject1 :"))
            subject2 = int(input("Subject2 :"))
            subject3 = int(input("Subject3 :"))
            subject4 = int(input("Subject4 :"))
            subject5 = int(input("Subject5 :"))
            Total = subject1 + subject2 + subject3 + subject4 + subject5
            print("Total : ", Total)
            Percentage = Total / 5
            print("Percentage : ", f"{Percentage:.13f}")

        def BMI():
            print("Body Mass Index")
            print("-----------------")
            bmiIndex = int(input("Enter the BMI Index: "))
            if(bmiIndex <= 18.5):
                print("Under Weight")
            elif(bmiIndex > 18.5 and bmiIndex <= 24.9):
                print("Normal Weight")
            elif(bmiIndex >= 25 and bmiIndex <=29.9):
                print("Over Weight")
            else:
                print("Obesse")

        def Triangle():
            hgt = int(input("Height :"))
            brt = int(input("Breadth :"))
            print("Area Formula: (Height * Breadth) / 2 ")
            Area = (hgt * brt)/2
            print("Area of Triange: ", Area)    
            hgt1 = int(input("Height1 :"))
            hgt2 = int(input("Height2 :"))
            brt = int(input("Breadth1 :"))
            print("Perimeter formula: Height1+Height2+Breadth")
            Peri = hgt1 + hgt2 + brt
            print("Perimeter of Triange: ", Peri)
