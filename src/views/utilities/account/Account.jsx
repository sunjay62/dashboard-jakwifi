import React, { useState, useEffect } from 'react';
import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Modal, Form, Input } from 'antd';
import MainCard from 'ui-component/cards/MainCard';
import { Grid } from '@mui/material';
import { gridSpacing } from 'store/constant';
import { DataGrid } from '@mui/x-data-grid';
import { Tooltip } from '@material-ui/core';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Popconfirm } from 'antd';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import './account.scss';

const Account = () => {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const axiosPrivate = useAxiosPrivate(); // const refresh = useRefreshToken();

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    if (!fullname || !email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }

    handleSubmit();
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // FUNGSI UNTUK UPDATE DATA SETELAH ACTION

  function getApi() {
    const accessToken = localStorage.getItem('access_token');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: accessToken
    };
    const fetchAllUsers = async () => {
      try {
        // console.log(token);

        const res = await axiosPrivate.get('/administrator', {
          headers
        });
        setUsers(res.data.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchAllUsers();
  }

  // INI API UNTUK CREATE NEW SITE

  const handleSubmit = async () => {
    const postData = { email, fullname, password };
    try {
      const accessToken = localStorage.getItem('access_token');

      const response = await axiosPrivate.post('/administrator', postData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken
        }
      });

      // console.log(response.status);

      if (response.status === 200) {
        setFullname('');
        setEmail('');
        setPassword('');
        toast.success('Registered Successfully.');
        getApi();
      } else if (response.status === 409) {
        toast.error('User already exists.');
      } else {
        setError('Failed to register, please try again.');
      }
    } catch (error) {
      console.error(error);
      setError('Failed to register, please try again.');
    }
  };

  const columnSites = [
    {
      field: 'no',
      headerName: 'No',
      width: 70
    },
    { field: 'id', headerName: 'ID', flex: 1 },
    { field: 'fullname', headerName: 'Full Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'active', headerName: 'Status', flex: 1 }

    // ini contoh kalo pengen dapetin value dari 2 row di jadikan satu
    // {
    //   field: 'fullName',
    //   headerName: 'Full name',
    //   description: 'This column has a value getter and is not sortable.',
    //   sortable: false,
    //   width: 160,
    //   valueGetter: (params) => `${params.row.name || ''} ${params.row.lastName || ''}`
    // }
  ];

  // API DELETE DATA SITE

  const deleteAccount = async (id) => {
    try {
      const accessToken = localStorage.getItem('access_token');

      const res = await axiosPrivate.delete('/administrator', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken
        },
        data: {
          id: `${id}`
        }
      });

      // console.log('deleted clicked');
      if (res.status === 200) {
        toast.success('Deleted Successfuly.');
        getApi();
      } else {
        toast.error('Failed to delete user, please try again.');
      }
    } catch (err) {
      console.log(err);
    }
  };

  // API GET DATA SITE

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');

        const response = await axiosPrivate.get('/administrator', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: accessToken
          }
        });

        // console.log(response.data);
        setUsers(response.data.data);
        // isMounted && setUsers(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  // dummy data site
  //   const users = [
  //     { id: 'TCF-10001', public_ip: '101.255.255.255', name: 'TCR-10369 Jakwifi Site Kec Kepulauan Seribu Utara RW 005' },
  //     { id: 'TCF-10002', public_ip: '101.255.255.244', name: 'TCR-10370 Jakwifi Site Kec Kepulauan Seribu Utara RW 006' },
  //     { id: 'TCF-10003', public_ip: '101.255.255.233', name: 'TCR-1037 Jakwifi Site Kec Kepulauan Seribu Utara RW 007' }
  //   ];

  const actionColumn = [
    {
      field: 'action',
      headerName: 'Action',
      width: 150,
      renderCell: (rowData) => {
        return (
          <>
            <div className="cellAction">
              <Tooltip title="Edit" arrow>
                <div className="viewButtonOperator">
                  <DriveFileRenameOutlineIcon
                    className="viewIcon"
                    // onClick={() => handleShowEdit(rowData.id)}
                  />
                </div>
              </Tooltip>
              <Tooltip title="Delete" arrow>
                <div>
                  <Popconfirm
                    className="cellAction"
                    title="Delete Account"
                    description="Are you sure to delete this Account?"
                    onConfirm={() => deleteAccount(rowData.id)}
                    icon={
                      <QuestionCircleOutlined
                        style={{
                          color: 'red'
                        }}
                      />
                    }
                  >
                    <div className="deleteButtonOperator">
                      <DeleteForeverOutlinedIcon />
                    </div>
                  </Popconfirm>
                </div>
              </Tooltip>
            </div>
          </>
        );
      }
    }
  ];

  // INI UNTUK PEMBUATAN NOMOR URUT SECARA OTOMATIS
  const addIndex = (array) => {
    return array.map((item, index) => {
      item.no = index + 1;
      return item;
    });
  };

  // Layout Form Input

  const layout = {
    labelCol: {
      span: 5,
      style: {
        textAlign: 'left'
      }
    },
    wrapperCol: {
      span: 18
    }
  };

  const validateMessages = {
    required: '${label} is required!',
    types: {
      email: '${label} is not a valid email!'
    }
  };

  return (
    <MainCard title="Account Adminstrator">
      <ToastContainer />
      <Modal title="Input New Account" centered onOk={handleOk} onCancel={handleCancel} open={isModalOpen}>
        <Form
          {...layout}
          name="nest-messages"
          style={{
            maxWidth: 600,
            marginTop: 25
          }}
          validateMessages={validateMessages}
        >
          <Form.Item
            name={['user', 'fullname']}
            label="Full Name"
            rules={[
              {
                required: true
              }
            ]}
          >
            <Input value={fullname} onChange={(e) => setFullname(e.target.value)} />
          </Form.Item>
          <Form.Item name={['user', 'email']} label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: 'Please input your password!'
              }
            ]}
          >
            <Input.Password value={password} onChange={(e) => setPassword(e.target.value)} />
          </Form.Item>
        </Form>
      </Modal>

      <Grid container spacing={gridSpacing}>
        <Grid item xs={12} className="gridButton">
          <Button type="primary" icon={<PlusCircleOutlined />} onClick={showModal}>
            Add New
          </Button>
        </Grid>
        <Grid item xs={12}>
          <DataGrid
            columns={columnSites.concat(actionColumn)}
            rows={addIndex(users)}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 }
              }
            }}
            pageSizeOptions={[5, 10, 50, 100]}
          />
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default Account;
