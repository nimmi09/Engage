const {file_utility} =require('./file-utility');
const { client }= require("./database");
class sql_helper{
static accept_user(id){
    client.query(
        `SELECT * FROM tempusers
          WHERE user_id = $1`,
        [id],
        (err, results) => {
          if (err) {
            
            console.log(err);
          }
          type=results.rows[0].type
          id=results.rows[0].user_id
          name=results.rows[0].user_name
          email=results.rows[0].email
          desg=results.rows[0].user_designation
          hashedPassword=results.rows[0].password
          
          
          client.query(
            `INSERT INTO users (type,user_id,user_name, email,user_designation, password)
                VALUES ($1, $2, $3, $4,$5,$6)`,
            [type,id,name, email,desg, hashedPassword],
            (err, results1) => {
              if (err) {
                throw err;
              }
              
            }
          );
          client.query(
            `DELETE from tempusers WHERE user_id=$1`,
            [id],
            (err, results1) => {
              if (err) {
                throw err;
              }
             
            }
    
          );
        });
}
static accept_offender (id){
    client.query(
        `SELECT * FROM tempoffender
          WHERE offender_id = $1`,
        [id],
        (err, results) => {
          if (err) {
            
            console.log(err);
          }
          user_id=results.rows[0].user_id
          offender_age=results.rows[0].offender_age
          offender_name=results.rows[0].offender_name
          offender_gender=results.rows[0].offender_gender
          offender_id=results.rows[0].offender_id
          date_added=results.rows[0].date_added
          image_id=results.rows[0].image_id
          
          
          client.query(
            `INSERT INTO offender (user_id,offender_age,offender_name,offender_gender,offender_id,date_added,image_id)
                VALUES ($1, $2, $3, $4,$5,$6,$7)`,
            [user_id,offender_age,offender_name,offender_gender,offender_id,date_added,image_id],
            (err, results1) => {
              if (err) {
                throw err;
              }
              
            }
          );
          client.query(
            `DELETE from tempoffender WHERE offender_id=$1`,
            [id],
            (err, results1) => {
              if (err) {
                throw err;
              }
             
            }
    
          );
          
        });
        //accepting image
        client.query(
            `SELECT * FROM tempimages
              WHERE offender_id = $1`,
            [id],
            (err, results) => {
              if (err) {
                
                console.log(err);
              }
              for (let i=0;i<results.rows.length;i++){
                image_path=results.rows[i].path
                image_id=results.rows[i].image_id

                //moving file to permanent folder
               file_utility.movefile(image_path)

                //adding file in database permanent storage
                client.query(
                    `INSERT INTO images (path,image_id,offender_id)
                        VALUES ($1, $2, $3)`,
                    [image_path,image_id,id],
                    (err, results1) => {
                      if (err) {
                        throw err;
                      }
                      
                    }
                  );
              }
              
              
             
              //deleting file from temporary database storage
              client.query(
                `DELETE from tempimages WHERE offender_id=$1`,
                [id],
                (err, results1) => {
                  if (err) {
                    throw err;
                  }
                 
                }
        
              );
              
            });

}
static reject_user(id){

      client.query(
        `DELETE from tempusers WHERE user_id=$1`,
        [id],
        (err, results) => {
          if (err) {
            throw err;
          }
         
        }
      );}
      

static reject_offender(id){
    client.query(
        `SELECT * FROM tempimages
          WHERE offender_id = $1`,
        [id],
        (err, results) => {
          if (err) {
            
            console.log(err);
          }
          
          images=Array.from(results.rows);
         file_utility.deletefile(images);
        }
      );
  
      //deleting rejected offender from temporary storage
        client.query(
          `DELETE from tempoffender WHERE offender_id=$1`,
          [id],
          (err, results) => {
            if (err) {
              throw err;
            }
           
          }
        );
        //deleting rejected offender's image paths from temporary storage
        client.query(
          `DELETE from tempimages WHERE offender_id=$1`,
          [id],
          (err, results) => {
            if (err) {
              throw err;
            }
           
          }
        );
        
     
}
static user_requests=function(user_type,cb){
    
    client.query(
        `SELECT * FROM tempusers where type=$1`,
        [user_type],
        
        (err, results) => {
          if (err) {
            
           return cb(err);
          
          }
         
        return cb(undefined,results);
    }
        );
      
}
static offender_requests=function(cb){
   
    client.query(
        `SELECT * FROM tempoffender`,
       
        
        (err, results) => {
          if (err) {
            
            return cb(err);
          }
          
          return cb(undefined,results);
          
          
        }
      );
      
}
static get_offence_categories=function(cb){
   
    client.query(
        `SELECT * FROM offence_category`,
       
        
        (err, results) => {
          if (err) {
            
            return cb(err);
          }
         
          return cb(undefined,results);
          
          
        }
      );
      
}
static get_locations=function(cb){
   
    client.query(
        `SELECT * FROM location`,
       
        
        (err, results) => {
          if (err) {
            
            return cb(err);
          }
         
          return cb(undefined,results);
          
          
        }
      );
      
}
static add_offender=function(Offender,cb){
    
    client.query(
        `INSERT INTO tempoffender (user_id,offender_age,offender_gender,date_added,offender_name)
            VALUES ($1, $2, $3, $4,$5) RETURNING offender_id`,
        
        [Offender.user_id,Offender.age,Offender.gender,Offender.date_added,Offender.name],
        (err, results) => {
          if (err) {
              console.log(err);
            return cb(err);
            
          }
          var offender_id=results.rows[0].offender_id;
          
          return cb(undefined,offender_id);
    
}
    );
  
}
static get_location_id=function(Location,cb){
    
    client.query(
        `Select loc_id from location 
           where region = $1 `,
        [Location.region],
        (err, results) => {
          if (err) {
            return cb(err);
          }
         var loc_id=results.rows[0].loc_id
         return cb(undefined,loc_id);
});

}
static new_category=function(Category,cb){
    client.query(
        `INSERT INTO tempoffence_category (category_name)
            VALUES ($1) RETURNING category_id `,
        [Category.category_name],
        (err, results) => {
          if (err) {
            return cb(err);
          }
         var category_id=results.rows[0].category_id;
         return cb(undefined,category_id);
});
}
static new_location=function(Location,cb){
    client.query(
        `INSERT INTO templocation (region)
            VALUES ($1) RETURNING loc_id `,
        [Location.region],
        (err, results) => {
          if (err) {
            return cb(err);
          }
         var loc_id=results.rows[0].loc_id;
         return cb(undefined,loc_id);
});
}
static get_category_id=function(Category,cb){
    client.query(
        `SELECT category_id from offence_category where category_name=$1 `,
        [Category.category_name],
        (err, results) => {
          if (err) {
            return cb(err);
          }
          
         var category_id=results.rows[0].category_id;
         return cb(undefined,category_id);
});
}
static get_loc_id=function(Location,cb){
    client.query(
        `SELECT * from location where region=$1 `,
        [Location.region],
        (err, results) => {
          if (err) {
            return cb(err);
          }
          console.log(Location);
          console.log(results,results.rows[0]);
          var loc_id=results.rows[0].loc_id;
         
          return cb(undefined,loc_id);
});
}
static add_offender_image=function(Image,cb){
    client.query(
        `INSERT INTO tempimages (path,offender_id)
            VALUES ($1, $2) `,
        [Image.path,Image.offender_id],
        (err, results) => {
          if (err) {
            return cb(err);
          }
       
});
}
static add_offence_details(Offence){
    client.query(
        `INSERT INTO tempoffence (offender_id,loc_id,victim_id,category_id,date_committed,user_id)
            VALUES ($1,$2,$3,$4,$5,$6)  `,
        [Offence.offender_id,Offence.loc_id,Offence.victim_id,Offence.category_id,Offence.date_committed,Offence.user_id],
        (err, results) => {
          if (err) {
            throw err;
          }
         
          
          
        }
      );
}
static add_victim=function(Victim,cb){
   console.log('reached',Victim);
    client.query(
        `INSERT INTO tempvictim (victim_age,victim_gender)
            VALUES ($1, $2) RETURNING victim_id`,
        [Victim.age,Victim.gender],
        (err, results) => {
          if (err) {
            return cb(err);
          }
          console.log('reached2',Victim);
          var victim_id=results.rows[0].victim_id;
          return cb(undefined,victim_id);

    
}
    );
      
}
static get_images=function(cb){
   
    client.query(
        `SELECT * from images `,
       
        (err, results) => {
          if (err) {
            return cb(err);
          }
          //requests=Array.from(results.rows);
          return cb(undefined,results);
        }
    );
    
}

static get_users=function(email,cb){
   
    client.query(
        `SELECT * from users where email=$1 `,[email],
       
        (err, results) => {
          if (err) {
            return cb(err);
          }
          //requests=Array.from(results.rows);
          return cb(undefined,results);
        }
    );
   
}
static add_user(User){
client.query(
    `INSERT INTO tempusers (type,user_name, email,user_designation, password)
        VALUES ($1, $2, $3, $4,$5)`,
    [type,name, email,desg, hashedPassword],
    (err, results) => {
      if (err) {
        throw err;
      }
     
      req.flash("success_msg", "You are now registered. Please log in");
      res.redirect("/users/login");
    }
  );
  return 'success';
}
}
module.exports={ sql_helper };