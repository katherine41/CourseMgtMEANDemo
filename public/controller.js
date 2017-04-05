/**
 * Created by zhangyuxi on 2017/3/7.
 */
var app=angular.module("myApp",["ngRoute"]);
app.config(function($routeProvider){
    $routeProvider.when("/",{
        templateUrl:"../views/login.html",
        controller:"loginController"
    })
        .when("/register",{
        templateUrl:"../views/register.html",
        controller:"registerController"
    })
        .when("/addStudent",{
            templateUrl:"../views/addStudent.html",
            controller:"addStudentController"
        })
        .when("/monitorClass",{
            templateUrl:"../views/monitorClass.html",
            controller:"monitorClassController"
        })
});

app.factory("userService",function($http){
    return{
        userRegister:function (newUser) {
            return $http.post("/api/register",newUser);
        },
        userLogin:function(loginUser){
          return $http.post("/api/login",loginUser);
        },
        addStudent:function(newStudent){
            return $http.post("/api/addStudent",newStudent);
        },
        findStudentByClass:function(classname){
            return $http.post("/api/studentsInClass",classname);
        },
        findStudentByNameAndClass:function(student){
            return $http.post("/api/findStudentByNameAndClass",student);
        }
    }
});
var currentUser=null;
app.factory("userData",function(){
    var className=[
        {"name":"Class1"},
        {"name":"Class2"},
        {"name":"Class3"},
        {"name":"Class4"},
        {"name":"Class5"},
        {"name":"Class6"},
        {"name":"Class7"},
        {"name":"Class8"},
        {"name":"Class9"},
        {"name":"Class10"}
    ];
    return{
       currentUser:currentUser,
        className:className
    }
});
app.directive("myNavbar",function(){
    return{
        templateUrl:"../views/navTemplate.html"
    }
});
app.controller("loginController",["$scope","$location","userService","userData",function($scope,$location,userService,userData){
    $scope.userLogin=function(username,password){
        var loginUser={
            username:username,
            password:password
        };
        if(username!==undefined&&password!=undefined){
            userService.userLogin(loginUser)
                .then(function(res){
                    if(res.data!=="404"){
                        userData.currentUser=res.data;
                        $location.path("/addStudent");
                    }
                },function(err){
                    console.log(err);
                });
        }
    };
    $scope.gotoRegister=function(){
        $location.path("/register");
    }
}]);
app.controller("registerController",["$scope","userService","userData","$location",function($scope,userService,userData,$location){
    $scope.register=function(username,password){
        if(username!==undefined&&password!==undefined){
            var newUser={
                username:username,
                password:password
            };
            userService.userRegister(newUser)
                .then(function(res){
                    userData.currentUser=res.data;
                    $location.path("/addStudent")
                },function(err){
                    console.log(err);
                });
        }
    };
    $scope.gotoLogin=function(){
        $location.path("/");
    }
}]);

app.controller("addStudentController",["$scope","$location","userData","userService",function($scope,$location,userData,userService){
    if(userData.currentUser===null){
        $location.path('/');
    }else{
        $scope.selectClasses=userData.className;
        $scope.addStudent=function(className,studentName,subject1mark,subject2mark,subject3mark){
            var newStudent={
                "class":className,
                "name":studentName,
                "subject1":subject1mark,
                "subject2":subject2mark,
                "subject3":subject3mark
            };
            if(className!==undefined&&studentName!==undefined&&subject1mark!==undefined&&subject2mark!==undefined&&subject3mark!==undefined){
                userService.addStudent(newStudent)
                    .then(function(res){
                        $location.path("/monitorClass");
                    },function (err){
                        console.log(err);
                    });
            }
        };
        $scope.logout=function(){
            $location.path("/");
            userData.currentUser=null;
        }
    }
}]);
app.controller("monitorClassController",["$scope","userData","userService","$location",function($scope,userData,userService,$location){
    if(userData.currentUser===null){
        $location.path('/');
    }else{
        $scope.selectClasses=userData.className;
        $scope.selectedClassChanged=function(){
            // console.log($scope.selectedClass);
            var classname={
                classname:$scope.selectedClass
            };
            userService.findStudentByClass(classname)
                .then(function(res){
                    $scope.selectStudents=res.data;
                },function(err){
                    console.log(err);
                })
        };
        $scope.selectedStudentChanged=function(){
            var student={
                classname:$scope.selectedClass,
                studentname:$scope.selectedStudent
            };
            userService.findStudentByNameAndClass(student)
                .then(function(res){
                    // console.log(res.data);
                    $scope.currentStudent=res.data;
                    var average=(res.data.subject1+res.data.subject2+res.data.subject3)/3;
                    $scope.average=Math.round(average);
                },function(err){
                    console.log(err);
                })
        };
        $scope.logout=function(){
            $location.path("/");
            userData.currentUser=null;
        }
    }
}]);
