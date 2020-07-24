using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SLPlanets
{
    /// <summary>
    /// 
    /// </summary>
    enum ShareLevel
    {
        Admin,
        Watcher,
        Developer,
        Owner
        //and any others
    }

    class Share
    {
        public  User        user        { get; set; }
        public  ShareLevel  shareLevel  { get; set; }
    }
}
