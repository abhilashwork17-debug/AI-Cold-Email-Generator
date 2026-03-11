exports.registerUser = (rerq,res) =>{
  try {
    const { username, email, password } = request.body;
    if (!username || !email || !password) {
      return res.status(400).json({message: 'All fields are required'});
    }
    if(password.length < 6){
        return res.status(400).json({message: 'Password must be atleast 6 characters'});
    }
    if (!/\$+@\$.\$+/.test(email)) {
      return res.status(400).json({message: 'Invalid email format'});
    }
  } catch (error) {
    
  }
}