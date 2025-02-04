class APIFeatures {
  constructor(query, queryString) {
    this.query = query; //Tours.find()
    this.queryString = queryString; //req.query
  }

  filter() {
    const queryObj = { ...this.queryString }; //to make a new copy not affecting the query object
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]); //removefrom queryObj the unwanted fields

    //advanced filtering
    let querySTR = JSON.stringify(queryObj); //convert to string
    querySTR = querySTR.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); //\b to make it exact /g for replacing all

    // console.log(JSON.parse(querySTR)); //convert back to json object
    this.query = this.query.find(JSON.parse(querySTR));
    return this; //the entire query object
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  fields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); //remove the __v field
    }
    return this;
  }
  pagination() {
    const page = this.queryString.page * 1 || 1; //default value 1
    const limit = this.queryString.limit * 1 || 100; //default value 100
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    //not necessary
    // if (this.queryStringpage) {
    //   const numTours = await Tours.countDocuments(); //count the number of documents
    //   if (skip >= numTours) {
    //     throw new Error('This page does not exist');
    //   }
    // }
    return this;
  }
}
module.exports = APIFeatures;
