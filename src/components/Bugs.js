import { useEffect, Fragment } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

import { loadBugs, getUnresolvedBugs, resolveBug } from "../store/bugs";

const Bugs = () => {
  const dispatch = useDispatch();
  const bugs = useSelector(getUnresolvedBugs);

  useEffect(() => {
    dispatch(loadBugs())
  }, []);

  return (
    <ul>
      {bugs.map((bug) => (
        <Fragment key={bug.id}>
          <li>
            {bug.description}
            <button onClick={() => dispatch(resolveBug(bug.id))}>resolve</button>
          </li>
        </Fragment>
      ))}
    </ul>
  );
};

export default Bugs;
