using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SLPlanets
{
    /// <summary>
    /// I made a class but (similar with Share) it is a simple KeyValuePair
    /// </summary>
    class Modification
    {
        public  User        user                { get; set; }
        public  DateTime    modificationTime    { get; set; }

        //Some other stuff could come later..maybe a "type" of modification, etc...
    }
}
