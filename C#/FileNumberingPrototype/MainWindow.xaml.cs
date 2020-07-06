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
        //Global Dialog Properties
        public SLLists slLists { get; set;}


        public MainWindow()
        {
            InitializeComponent();                   
            slLists = new SLLists();

            cb_VolumeSystem.ItemsSource = slLists.VolumeSystem;

            
        }

        private void UserOnClick(object sender, RoutedEventArgs e)
        {
            MessageBox.Show("User Dialog");
        }

        private void ContentOnClick(object sender, RoutedEventArgs e)
        {
           // MessageBox.Show("Content Dialog");

            string path = Utility.GetFilePathXlsx("Get The Excel File");
           //string path = "E:\\triangle\\work\\work_ltd\\SupperLeggera\\development\\main\\super_leggera\\C#\\FileNumberingPrototype\\input\\Test5.xls";
            //string path = "..\\..\\input\\Test5.xls";
            // MessageBox.Show(path);

            _Application excel = new _Excel.Application();
            Workbook wb = excel.Workbooks.Open(path);
            Worksheet ws= (Worksheet)wb.Worksheets[1];  
            
            Range excelRange = ws.UsedRange;
            int rowCount = excelRange.Rows.Count;
            int colCount = excelRange.Columns.Count;

            //For Every row (we know the structure fill the lists)
            
                for (int i = 1; i <= colCount; i+=2)
                {
                    for (int j = 1; j <= rowCount; j++)
                    {
                        if(i == 1)
                        {
                            Range range1 = (ws.Cells[j, i] as Range);

                            string cellValue1 = range1.Value.ToString();
                            Range range2 = (ws.Cells[j, i+1 ] as Range);
                            string cellValue2 = range2.Value.ToString();
                            slLists.Level.Add(new KeyValuePair<string, string>( cellValue1, cellValue2 ));
                        }                           
                        
                        
                    }
                }
              
            string test = "";

            foreach (KeyValuePair<string, string> level in slLists.Level)
            {
                test += level.Key + "," + level.Value;
                
            }            

            wb.Close(false, null, null);
            excel.Quit();

            MessageBox.Show(test);
          

        }

        private void Cb_VolumeSystem_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {

            
        }

    }
}
