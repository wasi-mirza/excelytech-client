// export default GetProposal;
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../../shared/utils/endPointNames";
function GetProposal() {
  const [proposals, setProposals] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [proposalsPerPage] = useState(5);
  const navigate = useNavigate();

  const [auth] = useAuth();
  const [proposaldata, setProposalData] = useState(null);

  const fetchProposals = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/proposal/getAllProposals`, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      setProposals(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [auth]);

  const indexOfLastProposal = currentPage * proposalsPerPage;
  const indexOfFirstProposal = indexOfLastProposal - proposalsPerPage;
  const currentProposals = proposals.slice(
    indexOfFirstProposal,
    indexOfLastProposal
  );

  const totalPages = Math.ceil(proposals.length / proposalsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () =>
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  const prevPage = () =>
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));

  const [hoverStyle, setHoverStyle] = useState({});
  const getproductdta = (id) => {
    setProposalData(id);
    console.log("proposalData:", proposaldata);
    navigate("/user-dashboard/proposal-view");
  };
  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Proposal</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <a href="#">Home</a>
                </li>
                <li className="breadcrumb-item active">Proposal</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <table className="table table-bordered table-hover">
                    <thead>
                      <tr>
                        <th> Date</th>
                        <th>Title</th>

                        <th>Final Amount</th>
                        <th>Products</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentProposals.map((proposal) => (
                        <React.Fragment>
                          <tr key={proposal._id}>
                            <td>
                              {new Date(
                                proposal.createdAt
                              ).toLocaleDateString() || "N/A"}
                            </td>
                            <td>{proposal.title || "N/A"}</td>

                            <td>{proposal.finalAmount || "N/A"}</td>
                            <td>
                              <div className="text-center">
                                <button
                                  className="btn btn-success px-4 "
                                  onClick={() => getproductdta(proposal)}
                                >
                                  view
                                </button>
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                  {/* Pagination Controls */}
                  <nav className="mt-2">
                    <ul className="pagination">
                      <li className="page-item">
                        <button
                          onClick={prevPage}
                          className="page-link"
                          disabled={currentPage === 1}
                          onMouseEnter={() => setHoverStyle({ color: "blue" })}
                          onMouseLeave={() => setHoverStyle({})}
                          style={currentPage === 1 ? {} : hoverStyle}
                        >
                          Previous
                        </button>
                      </li>
                      {Array.from({ length: totalPages }, (_, index) => (
                        <li
                          key={index + 1}
                          className={`page-item ${
                            currentPage === index + 1 ? "active" : ""
                          }`}
                        >
                          <button
                            onClick={() => paginate(index + 1)}
                            className="page-link"
                          >
                            {index + 1}
                          </button>
                        </li>
                      ))}
                      <li className="page-item">
                        <button
                          onClick={nextPage}
                          className="page-link"
                          disabled={currentPage === totalPages}
                          onMouseEnter={() => setHoverStyle({ color: "blue" })}
                          onMouseLeave={() =>
                            setHoverStyle({ background: "blue" })
                          }
                          style={currentPage === totalPages ? {} : hoverStyle}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default GetProposal;
