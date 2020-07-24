using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SLPlanets
{
    class IC
    {
        //Every Container could have a unique ID. Not sure if it is needed but it seems like it is
        //I can imagine it is useful later for the possible BlockChain
        public  Guid            Id              { get; set; } // DEE6040D-308A-4560-8CF5-A6CF4F1182E6

        //Owner created the file or the folder
        public  User            Owner           { get; set; }

        //true if it is a file, false if it is only a folder
        //This is not needed if we are using polymorphism (casting) 
        public  bool            isFile          { get; set; }

        //I made a Share class, but this is a simple KeyValuePair - User + ShareLevel
        //So we can add as many Users to this list with different Share Levels
        //Once the IC is created we automatically add the OWNER as the first in the list (with the Owner Enum)
        //This will be important for filtering later on as well
        public  List<Share>     shares          { get; set; }
        

        //STRUCTURE
                
                //I am not sure about this...but the TOP Folder will always be a project
                //So every folder and file should know to which Project it belongs to...so we can save that
                //Although we could simply go up the chain until we hit parent==null and avoid this...
                public  ICProject       project         { get; set; } 
                
                //an innovation here is that a file can act as a folder..it can have children as well
                //if null it is the top folder
                public  IC              parent          { get; set; }

                //a list of children..again they could be files or folders
                public  List<IC>        children        { get; set; }

                public  ICHistory       history         { get; set; }    
    }
}
