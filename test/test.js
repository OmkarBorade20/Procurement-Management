
const chai=require('chai')
const chaiHttp =require('chai-http');
const server = require('../server'); 

const test_cases=require('./testcases/testcases.json')

chai.should();
chai.use(chaiHttp);


describe('Setting Up the Server for Testing.', () => {
  let token;
        before(function(done){
            setTimeout(function (){
              console.log("Waiting 2 second for db connection.")
            done();
            },2000)
        });

      
        before(function (done){
          console.log("Setting Token by calling /login Api")
         
            chai.request(server).post("/login")
            .send({"email":"omkar.borade@gmail.com","password":"Omkar123"}).set('Accept','application/json').end((err,res)=>{
              if (err)
              {
                  console.log("Error",err)
                  done(err);
              }
              res.should.have.status(200);
              if(res.status==200)
                token=res.body.data[0].Token;
    
              done();
          })
        })
  

    describe('API Tests', () => {
      
    for (let test of test_cases){
      it(test.description, (done)=>{
        
        let payload={
            ...test?.payload?.data
        }

     
        switch (test.method){

          case 'POST':

                  chai.request(server).post(test.url).set({'token':token})
                  .send(payload).set('Accept','application/json',{'token':token}).end((err,res)=>{
                    if (err)
                    {
                        console.log("Error",err)
                        done(err);
                    }
                    res.should.have.status(200);
                    if(res.status==200 && test.url=="/login")
                      token=res.body.data[0].Token;

                    done();
                })

            break;

          case 'PATCH':

                    chai.request(server).patch(test.url).send(payload).set('Accept','application/json',{'token':token}).end((err,res)=>{
                      if (err)
                      {
                          console.log("Error",err)
                          done(err);
                      }
                      res.should.have.status(200);
                      done();
                  })
            break;
          case 'GET':
                  
              chai.request(server).get(test.url).set({'token':token}).end((err,res)=>{
                if (err)
                {
                    console.log("Error",err)
                    done(err);
                }
                res.should.have.status(200);
                done();
            })

              break;

        }

      
      })
    }
     

    });

});