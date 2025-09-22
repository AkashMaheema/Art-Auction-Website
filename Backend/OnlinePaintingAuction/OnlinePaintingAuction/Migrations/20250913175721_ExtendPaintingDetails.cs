using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OnlinePaintingAuction.Api.Migrations
{
    /// <inheritdoc />
    public partial class ExtendPaintingDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Condition",
                table: "Paintings",
                type: "TEXT",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Dimensions",
                table: "Paintings",
                type: "TEXT",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "EstimateHigh",
                table: "Paintings",
                type: "TEXT",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "EstimateLow",
                table: "Paintings",
                type: "TEXT",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Medium",
                table: "Paintings",
                type: "TEXT",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Year",
                table: "Paintings",
                type: "INTEGER",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Condition",
                table: "Paintings");

            migrationBuilder.DropColumn(
                name: "Dimensions",
                table: "Paintings");

            migrationBuilder.DropColumn(
                name: "EstimateHigh",
                table: "Paintings");

            migrationBuilder.DropColumn(
                name: "EstimateLow",
                table: "Paintings");

            migrationBuilder.DropColumn(
                name: "Medium",
                table: "Paintings");

            migrationBuilder.DropColumn(
                name: "Year",
                table: "Paintings");
        }
    }
}
