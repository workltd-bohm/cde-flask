using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileNumberingPrototype
{
    class User
    {
        public  string                              Name        { get; set; }  
        public  bool                                IsAdmin     { get; set; } 
        public  KeyValuePair<string, string>        Project     { get; set; }         
        public  KeyValuePair<string, string>        Company     { get; set; }     
        public  KeyValuePair<string, string>        Role        { get; set; }  

        public User(bool isadmin)
        {
            IsAdmin = isadmin;
            Name = "Unknown";
            Project = new KeyValuePair<string, string>();
            Company = new KeyValuePair<string, string>();
            Role    = new KeyValuePair<string, string>();
        }
        
        
    }
}
