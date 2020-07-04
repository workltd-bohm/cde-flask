using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using Microsoft.Office.Interop.Excel;
using _Excel = Microsoft.Office.Interop.Excel;

namespace FileNumberingPrototype
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : System.Windows.Window
    {
        public MainWindow()
        {
            InitializeComponent();                   
            SLLists slLists = new SLLists();

            cb_VolumeSystem.ItemsSource = slLists.VolumeSystem;

            
        }

        private void UserOnClick(object sender, RoutedEventArgs e)
        {
            MessageBox.Show("User Dialog");
        }

        private void ContentOnClick(object sender, RoutedEventArgs e)
        {
           // MessageBox.Show("Content Dialog");

            //string path = Utility.GetFilePathXlsx("Get The Excel File");
           string path = "E:\\triangle\\work\\work_ltd\\SupperLeggera\\development\\main\\super_leggera\\C#\\FileNumberingPrototype\\input\\Test5.xls";
            //string path = "..\\..\\input\\Test5.xls";
            // MessageBox.Show(path);

            _Application excel = new _Excel.Application();
            Workbook wb = excel.Workbooks.Open(path);
            Worksheet ws= (Worksheet)wb.Worksheets[1];  
            
            Range excelRange = ws.UsedRange;
            int rowCount = excelRange.Rows.Count;
            int colCount = excelRange.Columns.Count;

            string finalstring = "";
            
                for (int i = 1; i <= rowCount; i++)
                {
                    for (int j = 1; j <= colCount; j++)
                    {
                        Range range = (ws.Cells[i, j] as Range);
                        string cellValue = range.Value.ToString();
 
                        //do anything
                        finalstring += cellValue + "\n";
                    }
                }
              
            /*if(ws.Cells[i,j].Value2 !=null)
            {
                MessageBox.Show(ws.Cells[i,j].Value2);
            }*/

            wb.Close(false, null, null);
            excel.Quit();


            MessageBox.Show(finalstring);

        }

        private void Cb_VolumeSystem_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {

            
        }

    }
}
