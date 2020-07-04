using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace FileNumberingPrototype
{
    public static class Utility
    {
        public static string GetFilePathXlsx(string title)
        {
            Stream myStream;
            SaveFileDialog saveFileDialog1 = new SaveFileDialog();

            saveFileDialog1.Title = title;
            saveFileDialog1.Filter              = "Excel Files | *.xls";
            saveFileDialog1.DefaultExt          = "xls";
            saveFileDialog1.RestoreDirectory    = true;
          

            if (saveFileDialog1.ShowDialog() == DialogResult.OK)
            {
                if ((myStream = saveFileDialog1.OpenFile()) != null)
                {
                   
                    myStream.Close();
                   
                    return saveFileDialog1.FileName;
                }
                else
                    return "";
            }
            else
                return "";
        }
    }
}
