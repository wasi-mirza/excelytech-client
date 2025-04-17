import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../shared/utils/endPointNames.js";
import { Spinner } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import * as RouteNames from "../../shared/utils/routeNames.js";

const UserProfile = () => {
  // const { id } = useParams(); // Get user ID from the URL
  const [user, setUser] = useState(null); // User data state
  const [loading, setLoading] = useState(true); // Loading state
  const [auth] = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/user/${auth?.user._id}`, {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        });
        console.log("User Pro",response.data);
        
        setUser(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [auth]);

  if (loading) {
    return <Spinner animation="border" className="text-center mt-5" />;
  }

  if (!user) {
    return <div className="alert alert-danger">User not found!</div>;
  }

  return (
    <div className="content-wrapper">
      {/* Content Header */}
      <section className="content-header">
  <div className="row align-items-center">
    <div className="col-md-6">
      <h1>User Profile</h1>
    </div>
    <div className="col-md-6 text-right">
      <button
        onClick={() =>
          navigate(`${RouteNames.EDIT_USER_PROFILE}/${user._id}`)
        }
        className="btn btn-dark"
      >
        Edit Profile
      </button>
    </div>
  </div>
</section>

      {/* Main Content */}
      <section className="content">
        <div className="row">
          {/* Profile Picture and Basic Info */}
          <div className="col-md-4">
            <div className="card card-info">
              <div className="card-header">
                <h3 className="card-title">Basic Information</h3>
              </div>
              <div className="card-body">
                <strong>
                  <i className="fas fa-envelope mr-1"></i> Email
                </strong>
                <p>{user.email}</p>
                <hr />
                <strong>
                  <i className="fas fa-phone mr-1"></i> Phone
                </strong>
                <p>{user.phone}</p>
                <hr />
                <strong>
                  <i className="fas fa-map-marker-alt mr-1"></i> Address
                </strong>
                <p>
                  {user.address
                    ? `${user.address.street1}, ${user.address.city}, ${user.address.zipCode}, ${user.address.state}, ${user.address.country}`
                    : "No address available"}
                </p>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="col-md-8">
            <div className="card card-success">
              <div className="card-header">
                <h3 className="card-title">Business Details</h3>
              </div>
              <div className="card-body">
                <strong>
                  <i className="fas fa-building mr-1"></i> Owner's Name
                </strong>
                <p>{user.businessDetails.clientName}</p>
                <hr />
                <strong>
                  <i className="fas fa-building mr-1"></i> Company Type
                </strong>
                <p>{user.businessDetails.companyType}</p>
                <hr />
                <strong>
                  <i className="fas fa-id-card mr-1"></i> Tax ID
                </strong>
                <p>{user.businessDetails.taxId}</p>
                <hr />
                <strong>
                  <i className="fas fa-users mr-1"></i> Employee Size
                </strong>
                <p>{user.businessDetails.employeeSize}</p>
                <hr />
                <strong>
                  <i className="fas fa-phone-alt mr-1"></i> Owner Phone
                </strong>
                <p>{user.businessDetails.ownerPhone}</p>
                <hr />
                <strong>
                  <i className="fas fa-envelope mr-1"></i> Owner Email
                </strong>
                <p>{user.businessDetails.ownerEmail}</p>
              </div>
            </div>
          </div>
          {/* Profile Picture and Basic Info */}
          <div className="col-md-5">
            <div className="card card-info">
              <div className="card-header">
                <h3 className="card-title">Account Information</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <strong>
                      <i className="fas fa-user mr-1"></i> Name
                    </strong>
                    <p>{user.name}</p>
                    <hr />
                  </div>
                  <div className="col-md-6">
                    <strong>
                      <i className="fas fa-user-circle mr-1"></i> User Type
                    </strong>
                    <p>{user.userType}</p>
                    <hr />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <strong>
                      <i className="fas fa-shield-alt mr-1"></i> Role
                    </strong>
                    <p>{user.role}</p>
                    <hr />
                  </div>
                  <div className="col-md-6">
                    <strong>
                      <i className="fas fa-user-tie mr-1"></i> Account Manager
                    </strong>
                    <p>{user.accountManagers.name}</p>
                    <hr />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <strong>
                      <i className="fas fa-ban mr-1"></i> Banned Account
                    </strong>
                    <p>{user?.isBanned ? "Yes" : "No"}</p>
                    <hr />
                  </div>
                  <div className="col-md-6">
                    <strong>
                      <i className="fas fa-credit-card mr-1"></i> Payment Status
                    </strong>
                    <p>{user?.paymentStatus}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Button */}
       
      </section>
    </div>
  );
};

export default UserProfile;
