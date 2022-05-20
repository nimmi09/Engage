const { file_utility } = require("./file-utility");
const { client } = require("./database");
const { showoffence } = require("./showoffence");
class sql_helper {
  static accept_user(id) {
    console.log("123", id);
    client.query(
      `SELECT * FROM tempusers
          WHERE user_id = $1`,
      [id],
      (err, results) => {
        if (err) {
          console.log(err);
        }
        var type = results.rows[0].type;

        var name = results.rows[0].user_name;
        var email = results.rows[0].email;
        var desg = results.rows[0].user_designation;
        var hashedPassword = results.rows[0].password;

        console.log(type, id, name, email, desg, hashedPassword);
        client.query(
          `INSERT INTO users (type,user_id,user_name, email,user_designation, password)
                VALUES ($1, $2, $3, $4,$5,$6)`,
          [type, id, name, email, desg, hashedPassword],
          (err, results) => {
            if (err) {
              throw err;
            }
          }
        );
        client.query(
          `DELETE from tempusers WHERE user_id=$1`,
          [id],
          (err, results) => {
            if (err) {
              throw err;
            }
          }
        );
      }
    );
  }
  static accept_offence(id) {
    client.query(
      `SELECT * FROM tempoffence
      WHERE offence_id = $1`,
      [id],
      (err, results) => {
        if (err) {
          console.log(err);
        }
        var user_id_offence = results.rows[0].user_id;
        var offender_id = results.rows[0].offender_id;
        var loc_id = results.rows[0].loc_id;
        var date_committed = results.rows[0].date_committed;
        var victim_id = results.rows[0].victim_id;
        var category_id = results.rows[0].category_id;

        client.query(
          `SELECT * FROM tempoffender
          WHERE offender_id = $1`,
          [offender_id],
          (err, results) => {
            if (err) {
              console.log(err);
            }
            var user_id_offender = results.rows[0].user_id;
            var offender_age = results.rows[0].offender_age;
            var offender_name = results.rows[0].offender_name;
            var offender_gender = results.rows[0].offender_gender;

            var date_added = results.rows[0].date_added;
            var image_id = results.rows[0].image_id;

            client.query(
              `INSERT INTO offender (user_id,offender_age,offender_name,offender_gender,offender_id,date_added,image_id)
                VALUES ($1, $2, $3, $4,$5,$6,$7)`,
              [
                user_id_offender,
                offender_age,
                offender_name,
                offender_gender,
                offender_id,
                date_added,
                image_id,
              ],
              (err, results1) => {
                if (err) {
                  throw err;
                }
              }
            );

            //accepting image
            client.query(
              `SELECT * FROM tempimages
    WHERE image_id = $1`,
              [image_id],
              (err, results) => {
                if (err) {
                  console.log(err);
                }
                for (let i = 0; i < results.rows.length; i++) {
                  var image_path = results.rows[i].path;
                  var image_id = results.rows[i].image_id;

                  //moving file to permanent folder
                  var image_path_new = file_utility.movefile(image_path);
                  console.log(image_path_new);
                  //adding file in database permanent storage
                  client.query(
                    `INSERT INTO images (path,image_id)
              VALUES ($1, $2)`,
                    [image_path_new, image_id],
                    (err, results1) => {
                      if (err) {
                        throw err;
                      }
                    }
                  );
                }

                //deleting file from temporary database storage
                client.query(
                  `DELETE from tempimages WHERE image_id=$1`,
                  [image_id],
                  (err, results1) => {
                    if (err) {
                      throw err;
                    }
                  }
                );
              }
            );

            client.query(
              `DELETE FROM  tempoffence  WHERE offence_id=$1`,
              [id],
              (err, results1) => {
                if (err) {
                  throw err;
                }
              }
            );
            client.query(
              `DELETE from tempoffender WHERE offender_id=$1`,
              [offender_id],
              (err, results1) => {
                if (err) {
                  throw err;
                }
              }
            );

            client.query(
              `SELECT * FROM tempvictim
              WHERE victim_id = $1`,
              [victim_id],
              (err, results) => {
                if (err) {
                  console.log(err);
                }

                var victim_age = results.rows[0].victim_age;
                var victim_gender = results.rows[0].victim_gender;

                client.query(
                  `INSERT INTO victim(victim_age,victim_gender,victim_id)
                        VALUES ($1, $2,$3)`,
                  [victim_age, victim_gender, victim_id],
                  (err, results1) => {
                    if (err) {
                      throw err;
                    }
                  }
                );
              }
            );

            client.query(
              `DELETE from tempvictim WHERE victim_id=$1`,
              [victim_id],
              (err, results1) => {
                if (err) {
                  throw err;
                }
              }
            );

            client.query(
              `SELECT * FROM tempoffence_category
                  WHERE category_id = $1`,
              [category_id],
              (err, results) => {
                if (err) {
                  throw err;
                }
                if (results.rows.length > 0) {
                  var category_name = results.rows[0].category_name;

                  client.query(
                    `INSERT INTO offence_category(category_id,category_name)
                            VALUES ($1, $2)`,
                    [category_id, category_name],
                    (err, results1) => {
                      if (err && err.code == 23505) {
                        client.query(
                          `SELECT category_id FROM offence_category where category_name=$1`,
                          [category_name],
                          (err, results) => {
                            if (err) {
                              throw err;
                            }
                            category_id = results.rows[0].category_id;
                            client.query(
                              `INSERT INTO offence (user_id,offender_id,loc_id,date_committed,offence_id,victim_id,category_id)
                                  VALUES ($1, $2, $3, $4,$5,$6,$7)`,
                              [
                                user_id_offence,
                                offender_id,
                                loc_id,
                                date_committed,
                                id,
                                victim_id,
                                category_id,
                              ],
                              (err, results1) => {
                                if (err) {
                                  throw err;
                                }
                              }
                            );
                          }
                        );
                      } else {
                        client.query(
                          `INSERT INTO offence (user_id,offender_id,loc_id,date_committed,offence_id,victim_id,category_id)
                            VALUES ($1, $2, $3, $4,$5,$6,$7)`,
                          [
                            user_id_offence,
                            offender_id,
                            loc_id,
                            date_committed,
                            id,
                            victim_id,
                            category_id,
                          ],
                          (err, results1) => {
                            if (err) {
                              throw err;
                            }
                          }
                        );
                      }
                    }
                  );
                }

                client.query(
                  `DELETE from tempoffence_category
              WHERE category_id = $1`,
                  [category_id],
                  (err, results1) => {
                    if (err) {
                      throw err;
                    }
                  }
                );
              }
            );
          }
        );
      }
    );
  }
  static reject_user(id) {
    client.query(
      `DELETE from tempusers WHERE user_id=$1`,
      [id],
      (err, results) => {
        if (err) {
          throw err;
        }
      }
    );
  }

  static reject_offence(id) {
    client.query(
      `SELECT * FROM tempoffence
      WHERE offence_id = $1`,
      [id],
      (err, results) => {
        if (err) {
          console.log(err);
        }

        var offender_id = results.rows[0].offender_id;

        var victim_id = results.rows[0].victim_id;
        var category_id = results.rows[0].category_id;

        client.query(
          `SELECT * FROM tempoffender
          WHERE offender_id = $1`,
          [offender_id],
          (err, results) => {
            if (err) {
              console.log(err);
            }

            var image_id = results.rows[0].image_id;

            client.query(
              `DELETE FROM  tempoffence  WHERE offence_id=$1`,
              [id],
              (err, results1) => {
                if (err) {
                  throw err;
                }
              }
            );
            client.query(
              `DELETE from tempoffender WHERE offender_id=$1`,
              [offender_id],
              (err, results1) => {
                if (err) {
                  throw err;
                }
              }
            );

            client.query(
              `DELETE from tempvictim WHERE victim_id=$1`,
              [victim_id],
              (err, results1) => {
                if (err) {
                  throw err;
                }
              }
            );

            client.query(
              `DELETE from tempoffence_category
              WHERE category_id = $1`,
              [category_id],
              (err, results1) => {
                if (err) {
                  throw err;
                }
              }
            );

            client.query(
              `SELECT * FROM tempimages
                WHERE image_id = $1`,
              [image_id],
              (err, results) => {
                if (err) {
                  console.log(err);
                }

                var images = Array.from(results.rows);
                file_utility.deletefile(images);
              }
            );

            //deleting rejected offender's image paths from temporary storage
            client.query(
              `DELETE from tempimages WHERE image_id=$1`,
              [image_id],
              (err, results) => {
                if (err) {
                  throw err;
                }
              }
            );
          }
        );
      }
    );
  }
  static user_requests = function (user_type, cb) {
    client.query(
      `SELECT * FROM tempusers where type=$1`,
      [user_type],

      (err, results) => {
        if (err) {
          return cb(err);
        }

        return cb(undefined, results);
      }
    );
  };
  static get_offence_requests = function (cb) {
    client.query(
      `SELECT * FROM tempoffence`,

      (err, offence_results) => {
        if (err) {
          console.log(err);
        }
        let offences = [];
        if (offence_results.rows.length == 0) {
          return cb(undefined, offences);
        }
        for (let i = 0; i < offence_results.rows.length; i++) {
          let Showoffence = new showoffence();

          var user_id_offence = offence_results.rows[i].user_id;
          var offender_id = offence_results.rows[i].offender_id;
          var loc_id = offence_results.rows[i].loc_id;
          var date_committed = offence_results.rows[i].date_committed;
          var victim_id = offence_results.rows[i].victim_id;
          var category_id = offence_results.rows[i].category_id;
          var offence_id = offence_results.rows[i].offence_id;
          Showoffence.user_id = user_id_offence;
          Showoffence.date_committed = date_committed;
          Showoffence.offence_id = offence_id;
          client.query(
            `SELECT * FROM tempoffender
          WHERE offender_id = $1`,
            [offender_id],
            (err, results) => {
              if (err) {
                console.log(err);
              }

              var user_id_offender = results.rows[0].user_id;
              var offender_age = results.rows[0].offender_age;
              var offender_name = results.rows[0].offender_name;
              var offender_gender = results.rows[0].offender_gender;

              var date_added = results.rows[0].date_added;
              var image_id = results.rows[0].image_id;

              Showoffence.offender_name = offender_name;

              Showoffence.offender_gender = offender_gender;
              Showoffence.offender_age = offender_age;

              client.query(
                `SELECT * FROM tempvictim
              WHERE victim_id = $1`,
                [victim_id],
                (err, results) => {
                  if (err) {
                    console.log(err);
                  }

                  var victim_age = results.rows[0].victim_age;
                  var victim_gender = results.rows[0].victim_gender;

                  Showoffence.victim_age = victim_age;
                  Showoffence.victim_gender = victim_gender;
                }
              );

              client.query(
                `SELECT * FROM tempoffence_category
                  WHERE category_id = $1`,
                [category_id],
                (err, results) => {
                  if (err) {
                    console.log(err);
                  }
                  if (results.rows.length > 0) {
                    var category_name = results.rows[0].category_name;
                    Showoffence.category_name = category_name;
                  } else {
                    client.query(
                      `SELECT * FROM offence_category
                        WHERE category_id = $1`,
                      [category_id],
                      (err, results) => {
                        if (err) {
                          console.log(err);
                        }
                        var category_name = results.rows[0].category_name;
                        Showoffence.category_name = category_name;
                      }
                    );
                  }
                }
              );
              client.query(
                `SELECT * FROM location
                WHERE loc_id = $1`,
                [loc_id],
                (err, results) => {
                  if (err) {
                    console.log(err);
                  }

                  var region = results.rows[0].region;
                  Showoffence.region = region;

                  offences.push(Showoffence);

                  if (i == offence_results.rows.length - 1) {
                    return cb(undefined, offences);
                  }
                }
              );
            }
          );
        }
      }
    );
  };
  static get_offence_categories = function (cb) {
    client.query(
      `SELECT * FROM offence_category`,

      (err, results) => {
        if (err) {
          return cb(err);
        }

        return cb(undefined, results);
      }
    );
  };
  static get_locations = function (cb) {
    client.query(
      `SELECT * FROM location`,

      (err, results) => {
        if (err) {
          return cb(err);
        }

        return cb(undefined, results);
      }
    );
  };
  static add_offender = function (Offender, cb) {
    console.log("add_offender reached");
    client.query(
      `INSERT INTO tempoffender (user_id,offender_age,offender_gender,date_added,offender_name,image_id)
            VALUES ($1, $2, $3, $4,$5,$6) RETURNING offender_id`,

      [
        Offender.user_id,
        Offender.age,
        Offender.gender,
        Offender.date_added,
        Offender.name,
        Offender.image_id,
      ],
      (err, results) => {
        if (err) {
          console.log(err);
          return cb(err);
        }
        var offender_id = results.rows[0].offender_id;

        return cb(undefined, offender_id);
      }
    );
  };
  static get_location_id = function (Location, cb) {
    client.query(
      `Select loc_id from location 
           where region = $1 `,
      [Location.region],
      (err, results) => {
        if (err) {
          return cb(err);
        }
        var loc_id = results.rows[0].loc_id;
        return cb(undefined, loc_id);
      }
    );
  };
  static add_new_category = function (Category, cb) {
    client.query(
      `INSERT INTO tempoffence_category (category_name)
            VALUES ($1) RETURNING category_id `,
      [Category.category_name],
      (err, results) => {
        if (err) {
          return cb(err);
        }
        var category_id = results.rows[0].category_id;
        return cb(undefined, category_id);
      }
    );
  };

  static get_category_id = function (Category, cb) {
    client.query(
      `SELECT category_id from offence_category where category_name=$1 `,
      [Category.category_name],
      (err, results) => {
        if (err) {
          return cb(err);
        }

        var category_id = results.rows[0].category_id;
        return cb(undefined, category_id);
      }
    );
  };
  static get_loc_id = function (Location, cb) {
    client.query(
      `SELECT * from location where region=$1 `,
      [Location.region],
      (err, results) => {
        if (err) {
          return cb(err);
        }
        console.log(Location);
        console.log(results, results.rows[0]);
        var loc_id = results.rows[0].loc_id;

        return cb(undefined, loc_id);
      }
    );
  };
  static add_offender_image = function (Image, cb) {
    client.query(
      `INSERT INTO tempimages (path)
            VALUES ($1) RETURNING image_id `,
      [Image.path],
      (err, results) => {
        if (err) {
          return cb(err);
        }
        var image_id = results.rows[0].image_id;
        return cb(err, image_id);
      }
    );
  };
  static add_offence_details(Offence) {
    client.query(
      `INSERT INTO tempoffence (offender_id,loc_id,victim_id,category_id,date_committed,user_id)
            VALUES ($1,$2,$3,$4,$5,$6)  `,
      [
        Offence.offender_id,
        Offence.loc_id,
        Offence.victim_id,
        Offence.category_id,
        Offence.date_committed,
        Offence.user_id,
      ],
      (err, results) => {
        if (err) {
          throw err;
        }
      }
    );
  }
  static add_victim = function (Victim, cb) {
    console.log("reached", Victim);
    client.query(
      `INSERT INTO tempvictim (victim_age,victim_gender)
            VALUES ($1, $2) RETURNING victim_id`,
      [Victim.age, Victim.gender],
      (err, results) => {
        if (err) {
          return cb(err);
        }
        console.log("reached2", Victim);
        var victim_id = results.rows[0].victim_id;
        return cb(undefined, victim_id);
      }
    );
  };
  static get_images = function (cb) {
    client.query(
      `SELECT * from images `,

      (err, results) => {
        if (err) {
          return cb(err);
        }
        //requests=Array.from(results.rows);
        return cb(undefined, results.rows);
      }
    );
  };

  static get_users = function (email, cb) {
    client.query(
      `SELECT * from users where email=$1 `,
      [email],

      (err, results) => {
        if (err) {
          return cb(err);
        }
        //requests=Array.from(results.rows);
        return cb(undefined, results);
      }
    );
  };
  static add_user(User, cb) {
    client.query(
      `INSERT INTO tempusers (type,user_name, email,user_designation, password)
        VALUES ($1, $2, $3, $4,$5)`,
      [
        User.type,
        User.user_name,
        User.email,
        User.user_designation,
        User.password,
      ],
      (err, results) => {
        if (err) {
          throw err;
        }

        return cb(undefined, "success");
      }
    );
  }
}
module.exports = { sql_helper };
