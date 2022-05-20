class showoffence{
    constructor(user_id_offence,offender_name,offender_gender,date_committed,category_name,offender_age,victim_gender,victim_age,region,offence_id) {
    this.user_id=user_id_offence;
    this.offender_name=offender_name;
    this.offender_age=offender_age;
    this.offender_gender=offender_gender;
    this.region=region;
    this.date_committed=date_committed;
    this.category_name=category_name;
    this.victim_gender=victim_gender;
    this.victim_age=victim_age;
    this.offence_id=offence_id;
    
    }
   
}
module.exports={showoffence};