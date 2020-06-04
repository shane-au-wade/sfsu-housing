const db = require('./postgres');
const connection = db.connection;
const uuidv4 = db.uuidv4;



class Student {

    static submitSurvey(email) {
        return new Promise((resolve,reject) => {
            connection.none('update users set survey_complete = true where email = $1;', [email])
            .then(() => {
                resolve(true)
            })
            .catch(e => {
                reject(false)
            })
        })
    }


    /**
     * 
     * @param {.student_id} userBody 
     * This route is used to check if the user is in the database 
     */

    static firstTimeUser(userBody){
        return new Promise((resolve,reject) => {
            let uuid = uuidv4()
            connection.none('insert into users (type,first_name,last_name,email,survey_complete,id) values ($1,$2,$3,$4,$5,$6)', ['student',userBody.first_name.toLowerCase(),userBody.last_name.toLowerCase(),userBody.student_email.toLowerCase(),false,uuid])
            .then(() => {
                resolve(false)
            }).catch(e => {
                    connection.one('select survey_complete from users where email=$1',[userBody.student_email.toLowerCase()])
                    .then((result) => {
                        reject(result.survey_complete)
                    }).catch(e => {
                        console.log(e)
                    })
            })
        })
    }

    static placeOrder(orderBody) {
        let uuid = uuidv4()
       return new Promise((resolve,reject) => {
       
        // console.log(orderBody.order)
        connection.none('insert into orders (student_id, event_id, "order", status, bag, id, pickup) values ($1,$2,$3,$4,$5,$6,$7)',[orderBody.student_id.toLowerCase(), orderBody.event_id,JSON.stringify(orderBody.order), orderBody.status, false, uuid, orderBody.pickup])
        .then(() => {
            let queries = orderBody.order.map(line => connection.none('insert into items (order_id, item, qty) values ($1,$2,$3)',[uuid, line.item, line.qty]))

            Promise.all(queries).then(function(values) {
                // console.log(values);
                let resObj = {status: true, id: uuid, student_email:orderBody.student_id.toLowerCase()}
                resolve(resObj)
              });

        }).catch((e) => {
            console.log(e)
            reject(false)
        })
       })
    }
    
}

module.exports = Student