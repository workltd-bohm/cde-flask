using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SLPlanets
{
    /// <summary>
    /// A history of an Information Container (folder or a file)
    /// </summary>
    class ICHistory
    {
        public  DateTime            creationTime    { get; set; }
        public  List<Modification>  modifications   { get; set; }   
    }
}
