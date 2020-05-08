/* index.js */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/admin'); // 기본 설정에 따라 포트가 상이 할 수 있습니다.
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log("mongo db connection OK.");
});



var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var chatSchema = new mongoose.Schema({
  userId : String,
  message : Array,
  Time : Array,
  type : Array,
  count : Array

})

var chat = mongoose.model('chat',chatSchema);

io.on('connection', function (socket) {
    console.log('한명의 유저가 접속을 했습니다.');
    
    
socket.on('disconnect', function () {
    console.log('한명의 유저가 접속해제를 했습니다.');
});


socket.on('login_member',function(data){

  chat.find({userId:data.id},function(err,chats){
    if(err){
         console.log("에러다")
    }else{
      console.log(chats);
        if(!chats.length){
          chat.create({userId:data.id,message:[],Time:[]
          ,count:[] ,type:"user"},function(err){
            if(err) {
              console.log("chat 생성실패")
            }
         })  
      }   
   }
  }); 
 
 

});
 
socket.on('send_msg', function (data) {
  console.log(data.id);

  chat.updateMany({userId:data.id},
    {$push :{message :data.msg}},function(err){
      if(err){
        console.log("업데이트 실패")
      }
    });
    
  chat.updateMany({userId:data.id},
    {$push :{Time :data.Time}},function(err){
      if(err){
        console.log("업데이트 실패")
      }
    });
    chat.updateMany({userId:data.id},
      {$push :{type :data.type}},function(err){
        if(err){
          console.log("업데이트 실패")
        }
      });

  if(data.type=="user"){
      chat.updateMany({userId:data.id},
        {$push :{count :1}},function(err){
          if(err){
            console.log("업데이트 실패")
          }
        }); 
      }


//콘솔로 출력을 한다.
  console.log(data);
//다시, 소켓을 통해 이벤트를 전송한다.
  io.emit('send_msg', data);

  chat.find({},function(err,chats){
	  if(err){
	       console.log("에러다")
	  }else{
	 console.log(chats);
	io.emit('chats',chats);
	     }
	  });
});

chat.find({},function(err,chats){
  if(err){
       console.log("에러다")
     }else{
    	 console.log(chats);
    	io.emit('chats',chats);
  	     }
});
   
//어드민 아이디 클릭시 대화내용 가져오기
socket.on("userId",function(data){
	chat.find({userId:data},function(err,chatOne){
		  if(err){
		       console.log("에러다")
		     }else{
		    	 console.log(chatOne);
		    	io.emit('chatOne',chatOne);
          }          
  });

  chat.updateOne({userId:data},
    {$unset :{count :1}},function(err){
      if(err){
        console.log("업데이트 실패")
      }
    }); 
    chat.find({},function(err,chats){
      if(err){
           console.log("에러다")
      }else{
     console.log(chats);
    io.emit('chats',chats);
         }
      });

  

});
//고객화면 대화리스트 가져오기
socket.on("userId2",function(data){
	
	chat.find({userId:data},function(err,chatOne){
		  if(err){
		       console.log("에러다")
		     }else{
		    	 console.log(chatOne);
		    	io.emit('chatOne2',chatOne);
          }          
  });

});

});
http.listen(82, function () {
    console.log('listening on *:82');
});