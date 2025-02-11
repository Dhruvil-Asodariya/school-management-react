import {Link} from "react-router-dom"

const Dashboard_Card = ({name, total, link}) => {
    return(
        <div className="w-[300px] h-[150px] bg-white shadow-lg rounded-lg hover:shadow-xl hover:scale-104  transition-shadow">
          <Link to={link} className="block">
            <div className="text-center bg-blue-600 hover:bg-blue-500 rounded-t-lg py-4">
              <span className="text-xl font-semibold text-white">
                {name}
              </span>
            </div>
          </Link>
          <div className="mt-4 text-center">
            <span className="text-gray-500">Total: {total}</span>
          </div>
        </div>
    );
}

export default Dashboard_Card;