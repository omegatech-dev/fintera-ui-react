import PropTypes from "prop-types";

function ChartDataTable({ caption, columns, rows }) {
    if (!rows || rows.length === 0) return null;

    return (
        <table className="sr-only">
            <caption>{caption}</caption>
            {columns && columns.length > 0 && (
                <thead>
                    <tr>
                        {columns.map((column, index) => (
                            <th key={index} scope="col">
                                {column}
                            </th>
                        ))}
                    </tr>
                </thead>
            )}
            <tbody>
                {rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {row.map((cell, cellIndex) =>
                            cellIndex === 0 ? (
                                <th key={cellIndex} scope="row">
                                    {cell}
                                </th>
                            ) : (
                                <td key={cellIndex}>{cell}</td>
                            )
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

ChartDataTable.propTypes = {
    caption: PropTypes.string.isRequired,
    columns: PropTypes.arrayOf(PropTypes.string),
    rows: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.node)).isRequired,
};

export default ChartDataTable;
