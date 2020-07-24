using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SLPlanets
{
    /// <summary>
    /// The user will be able to define for which company they work for
    /// For now we will make a class and can expand on it later
    /// </summary>
    class Company
    {
        public  string  Name    { get; set; }
        
        //This is important - it is the Company Code, that will be used for renaming according to the ISO standard
        //it will be a three letter acronim - WRK for example
        public  string  Code    { get; set; }

        public  string  Street  { get; set; }
        //...etc...address...
    }
}
