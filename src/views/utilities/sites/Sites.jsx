import React, { useEffect, useState, useRef } from 'react';
import { Avatar, Menu, MenuItem, Grid } from '@mui/material';
import { DatePicker, Space, Select, Button, Dropdown } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import axiosNew from '../../../api/axiosNew';
import { pdf, Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { Image as PDFImage } from '@react-pdf/renderer';
import html2canvas from 'html2canvas';
import ApexCharts from 'apexcharts';
import { SearchOutlined } from '@ant-design/icons';
import SubCard from 'ui-component/cards/SubCard';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GetAppTwoToneIcon from '@mui/icons-material/GetAppOutlined';
import ArchiveTwoToneIcon from '@mui/icons-material/ArchiveOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import './sites.scss';
import { FileImageOutlined, FilePdfOutlined, FileExcelOutlined, FileZipOutlined } from '@ant-design/icons';
import ReactApexChart from 'react-apexcharts';
import XLSX from 'xlsx';

const TotalChart = () => {
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedRange, setSelectedRange] = useState([]);
  const [dataTraffic, setDataTraffic] = useState([]);
  const [dataDevice, setDataDevice] = useState([]);
  const [sites, setSites] = useState([]);
  const [siteName, setSiteName] = useState('');
  const [sitePublicIP, setSitePublicIP] = useState('');

  const { RangePicker } = DatePicker;
  dayjs.extend(customParseFormat);

  const [anchorElTraffic, setAnchorElTraffic] = useState(null);
  const [anchorElDevice, setAnchorElDevice] = useState(null);

  const handleClickTraffic = (event) => {
    setAnchorElTraffic(event.currentTarget);
  };

  const handleClickDevice = (event) => {
    setAnchorElDevice(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorElTraffic(null);
    setAnchorElDevice(null);
  };

  const onChangeSite = (value) => {
    setSelectedSite(value);

    // Get selected site name and public IP
    const selectedOption = sites.find((site) => site.value === value);
    if (selectedOption) {
      setSiteName(selectedOption.label);
      setSitePublicIP(selectedOption.publicIP);
    }
  };

  const onChangeRange = (dates, dateStrings) => {
    setSelectedRange(dateStrings);
  };

  const onMenuClick = async (e) => {
    const { key } = e;

    switch (key) {
      case '1':
        // Download Chart
        // Implement the logic to download the chart here
        downloadChart();
        break;
      case '2':
        // Download PDF
        // Implement the logic to download the PDF here
        await downloadPDF();
        break;
      case '3':
        // Download Excel
        // Implement the logic to download the Excel file here
        downloadExcel();
        break;
      case '4':
        // Download Excel
        // Implement the logic to download the Excel file here
        downloadCSV();
        break;
      default:
        break;
    }
  };

  const items = [
    {
      key: '1',
      label: 'Chart',
      icon: <FileImageOutlined />
    },
    {
      key: '2',
      label: 'PDF',
      icon: <FilePdfOutlined />
    },
    {
      key: '3',
      label: 'Excel',
      icon: <FileExcelOutlined />
    },
    {
      key: '4',
      label: 'CSV',
      icon: <FileZipOutlined />
    }
  ];

  const chartRef = useRef(null);

  const downloadCSV = async () => {
    const startData = selectedRange[0];
    const endData = selectedRange[1];
    handleClose();
    const requestData = {
      start_data: startData,
      end_data: endData,
      site_id: selectedSite
    };

    try {
      const response = await axiosNew.post('/monthly', requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const responseData = response.data;

      const trafficData = responseData.data.find((item) => item.name === 'BW usage per GB');
      const deviceData = responseData.data.find((item) => item.name === 'device');

      const updatedDataTraffic = trafficData.data.map((item, index) => ({
        No: index + 1,
        Months: item.month,
        'BW Usages': item.data >= 1000 ? `${(item.data / 1000).toFixed(2)} TB` : `${item.data} GB`,
        'Device Connected': `${deviceData.data[index]?.data || 'N/A'} Device`
      }));

      const csvContent = [
        ['Nama Site:', siteName],
        ['IP Publik:', sitePublicIP],
        ['Tanggal:', new Date().toLocaleDateString()],
        [], // Empty row for spacing
        ['No', 'Months', 'BW Usages', 'Device Connected'],
        ...updatedDataTraffic.map((row) => [row.No, row.Months, row['BW Usages'], row['Device Connected']])
      ].map((row) => row.join(','));

      const csvData = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent.join('\n'));

      const link = document.createElement('a');
      link.href = csvData;
      link.download = `${siteName}.csv`;
      link.click();
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 422) {
        toast.error('Please Input Site and Date Range!');
      } else {
        toast.error('Failed to download CSV file. Please try again.');
        console.log(error);
      }
    }
  };

  const downloadExcel = async () => {
    const startData = selectedRange[0];
    const endData = selectedRange[1];
    handleClose();
    const requestData = {
      start_data: startData,
      end_data: endData,
      site_id: selectedSite
    };

    try {
      const response = await axiosNew.post('/monthly', requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const responseData = response.data;

      const trafficData = responseData.data.find((item) => item.name === 'BW usage per GB');
      const deviceData = responseData.data.find((item) => item.name === 'device');

      const updatedDataTraffic = trafficData.data.map((item, index) => ({
        No: index + 1,
        Months: item.month,
        'BW Usages': item.data >= 1000 ? `${(item.data / 1000).toFixed(2)} TB` : `${item.data} GB`,
        'Device Connected': `${deviceData.data[index]?.data || 'N/A'} Device`
      }));

      const worksheet = XLSX.utils.json_to_sheet(updatedDataTraffic, {
        origin: 'A5' // Set the origin to row 6
      });

      // Add header data to the worksheet
      const headerData = [
        ['', 'Nama Site :', siteName],
        ['', 'IP Publik :', sitePublicIP],
        ['', 'Tanggal :', new Date().toLocaleDateString()]
      ];

      for (let i = 0; i < headerData.length; i++) {
        worksheet[XLSX.utils.encode_cell({ r: i, c: 1 })] = { t: 's', v: headerData[i][1] };
        worksheet[XLSX.utils.encode_cell({ r: i, c: 2 })] = { t: 's', v: headerData[i][2] };
      }

      // Set column widths
      const columnWidths = [{ wch: 3 }, { wch: 13 }, { wch: 15 }, { wch: 30 }];
      worksheet['!cols'] = columnWidths;

      // Apply bold font style to header cells
      const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: headerRange.s.r, c: col });
        const cell = worksheet[cellAddress];
        if (cell && cell.t === 's' && cell.v) {
          const boldFontStyle = { bold: true };
          const font = cell.s ? { ...cell.s.font, ...boldFontStyle } : boldFontStyle;
          cell.s = { font };
        }
      }

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Site');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${siteName}.xlsx`;
      link.click();
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 422) {
        toast.error('Please Input Site and Date Range!');
      } else {
        toast.error('Failed to download Excel file. Please try again.');
        console.log(error);
      }
    }
  };

  const handleDownloadExcelTraffic = async () => {
    const startData = selectedRange[0];
    const endData = selectedRange[1];
    handleClose();
    const requestData = {
      start_data: startData,
      end_data: endData,
      site_id: selectedSite
    };

    try {
      const response = await axiosNew.post('/monthly', requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Mengambil data dari respons
      // const responseStatus = response;
      const responseData = response.data;
      // console.log(responseStatus);

      // Update dataTraffic
      const trafficData = responseData.data.find((item) => item.name === 'BW usage per GB');
      const updatedDataTraffic = trafficData.data.map((item) => ({
        month: item.month,
        data: item.data
      }));

      // Membuat workbook baru
      const workbook = XLSX.utils.book_new();

      // Membuat worksheet baru
      const worksheet = XLSX.utils.json_to_sheet(updatedDataTraffic);

      // Menambahkan worksheet ke workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'BW Usage');

      // Mengubah workbook menjadi file Excel
      const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });

      // Membuat blob dari array buffer
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Membuat URL objek dari blob
      const url = URL.createObjectURL(blob);

      // Membuat link untuk mengunduh file
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${siteName}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Merelease objek URL
      URL.revokeObjectURL(url);

      if (response.status === 200) {
        toast.success('Download Successfully.');
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 422) {
        toast.error('Please Input Site and Date Range!');
      } else {
        setError('Failed to register, please try again.');
        console.log(error);
      }
    }
  };

  const handleDownloadExcelDevice = async () => {
    const startData = selectedRange[0];
    const endData = selectedRange[1];
    handleClose();
    const requestData = {
      start_data: startData,
      end_data: endData,
      site_id: selectedSite
    };

    try {
      const response = await axiosNew.post('/monthly', requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Mengambil data dari respons

      const responseData = response.data;
      // console.log(responseData);

      // Update dataDevice
      const deviceData = responseData.data.find((item) => item.name === 'device');
      const updatedDataDevice = deviceData.data.map((item) => ({
        month: item.month,
        data: item.data
      }));

      // Membuat workbook baru
      const workbook = XLSX.utils.book_new();

      // Membuat worksheet baru
      const worksheet = XLSX.utils.json_to_sheet(updatedDataDevice);

      // Menambahkan worksheet ke workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Device Connected');

      // Mengubah workbook menjadi file Excel
      const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });

      // Membuat blob dari array buffer
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Membuat URL objek dari blob
      const url = URL.createObjectURL(blob);

      // Membuat link untuk mengunduh file
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${siteName}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Merelease objek URL
      URL.revokeObjectURL(url);
      if (response.status === 200) {
        toast.success('Download Successfully.');
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 422) {
        toast.error('Please Input Site and Date Range!');
      } else {
        setError('Failed to register, please try again.');
        console.log(error);
      }
    }
  };

  const downloadChart = () => {
    const chartElement = document.getElementById('chartContainer');

    html2canvas(chartElement)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');

        const link = document.createElement('a');
        link.href = imgData;
        link.download = `${siteName}.png`;
        link.click();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const downloadChartBW = () => {
    const chartElement = document.getElementById('bwContainer');

    html2canvas(chartElement)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');

        const link = document.createElement('a');
        link.href = imgData;
        link.download = `${siteName}.png`;
        link.click();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const downloadChartDevice = () => {
    const chartElement = document.getElementById('deviceContainer');

    html2canvas(chartElement)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');

        const link = document.createElement('a');
        link.href = imgData;
        link.download = `${siteName}.png`;
        link.click();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const formatDataUsage = (value) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} TB`;
    } else {
      return `${value} GB`;
    }
  };

  const downloadPDF = async () => {
    const chartElement = document.querySelector('#chartContainer');
    const canvas = await html2canvas(chartElement);
    const imgData = canvas.toDataURL();
    const startData = selectedRange[0];
    const endData = selectedRange[1];
    handleClose();
    const requestData = {
      start_data: startData,
      end_data: endData,
      site_id: selectedSite
    };

    try {
      const response = await axiosNew.post('/monthly', requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const responseData = response.data;

      const trafficData = responseData.data.find((item) => item.name === 'BW usage per GB');
      const deviceData = responseData.data.find((item) => item.name === 'device');

      const updatedDataTraffic = trafficData.data.map((item, index) => ({
        month: item.month,
        bwUsage: item.data,
        device: deviceData.data[index]?.data || 'N/A'
      }));

      const tableData = [
        [
          { text: 'Months', style: 'tableHeader', width: '33.33%' },
          { text: 'BW Usages', style: 'tableHeader', width: '33.33%' },
          { text: 'Devices', style: 'tableHeader', width: '33.33%' }
        ]
      ];

      updatedDataTraffic.forEach((item) => {
        const dataValue = formatDataUsage(item.bwUsage);
        tableData.push([
          { text: item.month, style: 'tableCell' },
          { text: dataValue, style: 'tableCell' },
          { text: `${item.device} Device`, style: 'tableCell' }
        ]);
      });

      const MyDocument = ({ tableData }) => {
        const styles = StyleSheet.create({
          page: {
            fontFamily: 'Helvetica',
            padding: 20
          },
          logoContainer: {
            display: 'flex',
            width: '100%',
            alignItems: 'right',
            justifyContent: 'flex-end',
            marginBottom: 25,
            fontSize: 12,
            borderBottom: '2px solid grey',
            paddingBottom: 18
          },
          containerText: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            fontSize: 14,
            fontWeight: 'bold',
            marginTop: 10
          },
          logoText2: {
            width: '75%'
          },
          logoImage: {
            width: 175,
            height: 100
          },
          tableContainer: {
            display: 'table',
            width: '100%',
            borderStyle: 'solid',
            borderWidth: 1,
            borderRightWidth: 0,
            borderBottomWidth: 0,
            marginBottom: 20,
            fontSize: 12
          },
          tableRow: {
            flexDirection: 'row'
          },
          tableCellHeader: {
            backgroundColor: '#007bff',
            color: '#ffffff',
            fontWeight: 'bold',
            borderStyle: 'solid',
            borderBottomWidth: 1,
            borderRightWidth: 1,
            textAlign: 'center',
            width: '33.33%',
            padding: 5
          },
          tableCell: {
            borderStyle: 'solid',
            borderBottomWidth: 1,
            borderRightWidth: 1,
            textAlign: 'center',
            width: '33.33%',
            padding: 5
          },
          chartContainer: {
            width: '100%',
            height: 300
          },
          headerContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }
        });

        return (
          <Document>
            <Page size="A4" style={styles.page}>
              <View style={styles.logoContainer}>
                <View style={styles.headerContainer}>
                  <View style={{ width: '60%' }}>
                    <View style={styles.containerText}>
                      <Text style={styles.logoText1}>Nama Site </Text>
                      <Text>:</Text>
                      <Text style={styles.logoText2}>{siteName}</Text>
                    </View>
                    <View style={styles.containerText}>
                      <Text style={styles.logoText1}>IP Publik</Text>
                      <Text>&nbsp;&nbsp;&nbsp;&nbsp;:</Text>
                      <Text style={styles.logoText2}>{sitePublicIP}</Text>
                    </View>
                    <View style={styles.containerText}>
                      <Text style={styles.logoText1}>Tanggal</Text>
                      <Text>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</Text>
                      <Text style={styles.logoText2}>{new Date().toLocaleDateString()}</Text>
                    </View>
                  </View>
                  <PDFImage style={[styles.logoImage, { width: '35%' }]} src={require('../../../assets/images/logotachyon-new.png')} />
                </View>
              </View>
              <View style={styles.tableContainer}>
                {tableData.map((rowData, rowIndex) => (
                  <View style={styles.tableRow} key={rowIndex}>
                    {rowData.map((cellData, cellIndex) => (
                      <View style={[styles.tableCell, rowIndex === 0 && styles.tableCellHeader, { width: cellData.width }]} key={cellIndex}>
                        <Text>{cellData.text}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
              <View style={styles.chartContainer}>
                <PDFImage src={imgData} />
              </View>
            </Page>
          </Document>
        );
      };

      pdf(<MyDocument tableData={tableData} />)
        .toBlob()
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `${siteName}.pdf`;
          link.click();
        });
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 422) {
        toast.error('Please Input Site and Date Range!');
      } else {
        toast.error('Failed to download PDF. Please try again.');
        console.log(error);
      }
    }
  };

  // post data

  const onSearch = async () => {
    const startData = selectedRange[0];
    const endData = selectedRange[1];

    const requestData = {
      start_data: startData,
      end_data: endData,
      site_id: selectedSite
    };

    try {
      const response = await axiosNew.post('/monthly', requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const responseData = response.data;
      console.log(response);
      // setTableData(responseData.data);

      // Update dataTraffic
      const trafficData = responseData.data.find((item) => item.name === 'BW usage per GB');
      const updatedDataTraffic = trafficData.data.map((item) => ({
        month: item.month,
        data: item.data
        // totalDevices: item.totalDevices
      }));

      // Update dataDevice
      const deviceData = responseData.data.find((item) => item.name === 'device');
      const updatedDataDevice = deviceData.data.map((item) => ({
        month: item.month,
        data: item.data
        // totalDevices: item.totalDevices
      }));

      setDataTraffic(updatedDataTraffic);
      setDataDevice(updatedDataDevice);

      // Update site name and public IP based on selected site
      const selectedOption = sites.find((site) => site.value === selectedSite);
      if (selectedOption) {
        setSiteName(selectedOption.label);
        setSitePublicIP(selectedOption.publicIP);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // get data

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem('access_token');

      try {
        const response = await axiosNew.get('/site', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: accessToken
          }
        });

        // console.log(response);
        const data = response.data.data;
        const siteOptions = data.map((item) => ({
          value: item.id,
          label: item.name,
          publicIP: item.public_ip
        }));
        setSites(siteOptions);
      } catch (e) {
        console.log(e);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const options = {
      series: [
        {
          name: 'BW Usage',
          data: dataTraffic.map((item) => ({
            x: dayjs(item.month, 'MM/YYYY').valueOf(),
            y: item.data
          }))
        },
        {
          name: 'Device',
          data: dataDevice.map((item) => ({
            x: dayjs(item.month, 'MM/YYYY').valueOf(),
            y: item.data
          }))
        }
      ],
      chart: {
        height: 350,
        type: 'area'
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth'
      },
      xaxis: {
        type: 'datetime',
        tickPlacement: 'on'
      },
      yaxis: {
        forceNiceScale: true,
        labels: {
          formatter: function (value) {
            return parseInt(value);
          }
        }
      },
      tooltip: {
        x: {
          format: 'MM/yyyy'
        },
        y: {
          formatter: function (value, { seriesIndex }) {
            if (seriesIndex === 0) {
              if (value >= 1000) {
                return `${(value / 1000).toFixed(2)} TB`;
              } else {
                return `${value} GB`;
              }
            } else {
              return `${value} Device`;
            }
          }
        }
      }
    };

    const chart = new ApexCharts(document.querySelector('#chart'), options);
    chart.render();
    chartRef.current = chart;

    // Cleanup chart on unmount
    return () => {
      chart.destroy();
    };
  }, [dataTraffic, dataDevice]);

  // Area Line Chart options
  const areaLineOptions = {
    series: [
      {
        name: 'BW Usage',
        data: dataTraffic.map((item) => ({
          x: dayjs(item.month, 'MM/YYYY').valueOf(),
          y: item.data
        }))
      }
    ],
    chart: {
      height: 350,
      type: 'area'
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth'
    },
    xaxis: {
      type: 'datetime',
      tickPlacement: 'on'
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          if (value >= 1000) {
            return `${(value / 1000).toFixed(2)} TB`;
          } else {
            return `${value} GB`;
          }
        }
      }
    },
    tooltip: {
      x: {
        format: 'MM/yyyy'
      },
      y: {
        formatter: function (value) {
          if (value >= 1000) {
            return `${(value / 1000).toFixed(2)} TB`;
          } else {
            return `${value} GB`;
          }
        }
      }
    }
  };

  // Area Line Chart options untuk bagian Device
  const deviceOptions = {
    series: [
      {
        name: 'Devices',
        data: dataDevice.map((item) => ({
          x: dayjs(item.month, 'MM/YYYY').valueOf(),
          y: item.data
        }))
      }
    ],
    chart: {
      height: 350,
      type: 'area'
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth'
    },
    xaxis: {
      type: 'datetime',
      tickPlacement: 'on'
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          if (value) {
            return `${value} Unit`;
          } else {
            return `${value} Unit`;
          }
        }
      }
    },
    tooltip: {
      x: {
        format: 'MM/yyyy'
      },
      y: {
        formatter: function (value) {
          if (value) {
            return `${value} Unit`;
          } else {
            return `${value} Unit`;
          }
        }
      }
    },
    colors: ['#65e454'] // Ubah warna menjadi hijau
  };

  return (
    <div>
      <MainCard title="Jakwifi Analysis">
        <ToastContainer />
        <div className="dateContainer">
          <div className="dateLeft">
            <Select
              className="selectSites"
              showSearch
              placeholder="Select Site"
              optionFilterProp="children"
              onChange={onChangeSite}
              onSearch={onSearch}
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              options={sites}
            />
            <Space direction="vertical">
              <Dropdown.Button
                menu={{
                  items,
                  onClick: onMenuClick
                }}
              >
                Downloads
              </Dropdown.Button>
            </Space>
          </div>
          <Space size={12} className="dateRight">
            <RangePicker picker="month" onChange={onChangeRange} format="MM/YYYY" />
            <Button type="primary" shape="circle" icon={<SearchOutlined />} onClick={onSearch} />
          </Space>
        </div>
        <Grid container spacing={gridSpacing}>
          <Grid item xs={12} id="chartContainer">
            <SubCard>
              <div className="cardHeader">
                <h3>BW Usage & Devices Connected</h3>
              </div>
              <div id="chart">
                <ReactApexChart options={areaLineOptions} series={areaLineOptions.series} type="area" height={350} />
              </div>
            </SubCard>
          </Grid>
          <Grid item xs={12} id="bwContainer">
            <SubCard>
              <div className="cardHeader">
                <h3>BW Usage</h3>
                <div className="btnMenu">
                  <Avatar variant="rounded" aria-controls="menu-traffic-card" aria-haspopup="true" onClick={handleClickTraffic}>
                    <MoreHorizIcon fontSize="inherit" />
                  </Avatar>
                  <Menu
                    id="menu-traffic-card"
                    anchorEl={anchorElTraffic}
                    keepMounted
                    open={Boolean(anchorElTraffic)}
                    onClose={handleClose}
                    variant="selectedMenu"
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right'
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right'
                    }}
                  >
                    <MenuItem onClick={downloadChartBW}>
                      <GetAppTwoToneIcon sx={{ mr: 1.75 }} /> Download Chart
                    </MenuItem>
                    <MenuItem onClick={handleDownloadExcelTraffic}>
                      <ArchiveTwoToneIcon sx={{ mr: 1.75 }} /> Download Excel
                    </MenuItem>
                  </Menu>
                </div>
              </div>
              <div id="chart">
                <ReactApexChart options={areaLineOptions} series={areaLineOptions.series} type="area" height={350} />
              </div>
            </SubCard>
          </Grid>
          <Grid item xs={12} id="deviceContainer">
            <SubCard>
              <div className="cardHeader">
                <h3>Device Connected</h3>
                <div className="btnMenu">
                  <Avatar variant="rounded" aria-controls="menu-device-card" aria-haspopup="true" onClick={handleClickDevice}>
                    <MoreHorizIcon fontSize="inherit" />
                  </Avatar>
                  <Menu
                    id="menu-device-card"
                    anchorEl={anchorElDevice}
                    keepMounted
                    open={Boolean(anchorElDevice)}
                    onClose={handleClose}
                    variant="selectedMenu"
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right'
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right'
                    }}
                  >
                    <MenuItem onClick={downloadChartDevice}>
                      <GetAppTwoToneIcon sx={{ mr: 1.75 }} /> Download Chart
                    </MenuItem>
                    <MenuItem onClick={handleDownloadExcelDevice}>
                      <ArchiveTwoToneIcon sx={{ mr: 1.75 }} /> Download Excel
                    </MenuItem>
                  </Menu>
                </div>
              </div>
              <div id="chart-device">
                <ReactApexChart options={deviceOptions} series={deviceOptions.series} type="area" height={350} />
              </div>
            </SubCard>
          </Grid>
        </Grid>
      </MainCard>
    </div>
  );
};

export default TotalChart;
